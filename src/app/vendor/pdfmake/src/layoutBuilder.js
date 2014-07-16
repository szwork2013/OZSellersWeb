/* jslint node: true */
'use strict';

var TraversalTracker = require('./traversalTracker');
var DocMeasure = require('./docMeasure');
var DocumentContext = require('./documentContext');
var PageElementWriter = require('./pageElementWriter');
var ColumnCalculator = require('./columnCalculator');
var TableProcessor = require('./tableProcessor');
var Line = require('./line');
var pack = require('./helpers').pack;
var offsetVector = require('./helpers').offsetVector;
var fontStringify = require('./helpers').fontStringify;
var isFunction = require('./helpers').isFunction;

/**
 * Creates an instance of LayoutBuilder - layout engine which turns document-definition-object
 * into a set of pages, lines, inlines and vectors ready to be rendered into a PDF
 *
 * @param {Object} pageSize - an object defining page width and height
 * @param {Object} pageMargins - an object defining top, left, right and bottom margins
 */
function LayoutBuilder(pageSize, pageMargins, imageMeasure) {
	this.pageSize = pageSize;
	this.pageMargins = pageMargins;
	this.tracker = new TraversalTracker();
    this.imageMeasure = imageMeasure;
    this.tableLayouts = {};
}

LayoutBuilder.prototype.registerTableLayouts = function (tableLayouts) {
  this.tableLayouts = pack(this.tableLayouts, tableLayouts);
};

/**
 * Executes layout engine on document-definition-object and creates an array of pages
 * containing positioned Blocks, Lines and inlines
 *
 * @param {Object} docStructure document-definition-object
 * @param {Object} fontProvider font provider
 * @param {Object} styleDictionary dictionary with style definitions
 * @param {Object} defaultStyle default style definition
 * @return {Array} an array of pages
 */
LayoutBuilder.prototype.layoutDocument = function (docStructure, fontProvider, styleDictionary, defaultStyle, header, footer, images) {
	this.docMeasure = new DocMeasure(fontProvider, styleDictionary, defaultStyle, this.imageMeasure, this.tableLayouts, images);

  docStructure = this.docMeasure.measureDocument(docStructure);

  this.writer = new PageElementWriter(
    new DocumentContext(this.pageSize, this.pageMargins), this.tracker);

  this.processNode(docStructure);
  this.addHeadersAndFooters(header, footer);

	return this.writer.context().pages;
};

LayoutBuilder.prototype.addHeadersAndFooters = function(header, footer) {
  var pages = this.writer.context().pages;
  var headerGetter = isFunction(header) ? header : function() { return header; };
  var footerGetter = isFunction(footer) ? footer : function() { return footer; };

  for(var i = 0, l = pages.length; i < l; i++) {
    this.writer.context().page = i;

    var pageHeader = headerGetter(i + 1, l);
    var pageFooter = footerGetter(i + 1, l);

    if (pageHeader) {
      this.writer.beginUnbreakableBlock(this.pageSize.width, this.pageMargins.top);
      this.processNode(this.docMeasure.measureDocument(pageHeader));
      this.writer.commitUnbreakableBlock(0, 0);
    }

    if (pageFooter) {
      this.writer.beginUnbreakableBlock(this.pageSize.width, this.pageMargins.bottom);
      this.processNode(this.docMeasure.measureDocument(pageFooter));
      this.writer.commitUnbreakableBlock(0, this.pageSize.height - this.pageMargins.bottom);
    }
  }
};

LayoutBuilder.prototype.processNode = function(node) {
  var self = this;

  applyMargins(function() {
    if (node.stack) {
      self.processVerticalContainer(node.stack);
    } else if (node.columns) {
      self.processColumns(node);
    } else if (node.ul) {
      self.processList(false, node.ul, node._gapSize);
    } else if (node.ol) {
      self.processList(true, node.ol, node._gapSize);
    } else if (node.table) {
      self.processTable(node);
    } else if (node.text !== undefined) {
      self.processLeaf(node);
    } else if (node.image) {
      self.processImage(node);
    } else if (node.canvas) {
      self.processCanvas(node);
    } else if (!node._span) {
		throw 'Unrecognized document structure: ' + JSON.stringify(node, fontStringify);
		}
	});

	function applyMargins(callback) {
		var margin = node._margin;

    if (node.pageBreak === 'before') {
        self.writer.moveToNextPage();
    }

		if (margin) {
			self.writer.context().moveDown(margin[1]);
			self.writer.context().addMargin(margin[0], margin[2]);
		}

		callback();

		if(margin) {
			self.writer.context().addMargin(-margin[0], -margin[2]);
			self.writer.context().moveDown(margin[3]);
		}

    if (node.pageBreak === 'after') {
        self.writer.moveToNextPage();
    }
	}
};

// vertical container
LayoutBuilder.prototype.processVerticalContainer = function(items) {
	var self = this;
	items.forEach(function(item) {
		self.processNode(item);

		//TODO: paragraph gap
	});
};

// columns
LayoutBuilder.prototype.processColumns = function(columnNode) {
	var columns = columnNode.columns;
	var availableWidth = this.writer.context().availableWidth;
	var gaps = gapArray(columnNode._gap);

	if (gaps) availableWidth -= (gaps.length - 1) * columnNode._gap;

	ColumnCalculator.buildColumnWidths(columns, availableWidth);
	this.processRow(columns, columns, gaps);


	function gapArray(gap) {
		if (!gap) return null;

		var gaps = [];
		gaps.push(0);

		for(var i = columns.length - 1; i > 0; i--) {
			gaps.push(gap);
		}

		return gaps;
	}
};

LayoutBuilder.prototype.processRow = function(columns, widths, gaps, tableBody, tableRow) {
  var self = this;
  var pageBreaks = [];

  this.tracker.auto('pageChanged', storePageBreakData, function() {
    widths = widths || columns;

    self.writer.context().beginColumnGroup();

    for(var i = 0, l = columns.length; i < l; i++) {
      var column = columns[i];
      var width = widths[i]._calcWidth;
      var leftOffset = colLeftOffset(i);

      if (column.colSpan && column.colSpan > 1) {
          for(var j = 1; j < column.colSpan; j++) {
              width += widths[++i]._calcWidth + gaps[i];
          }
      }

      self.writer.context().beginColumn(width, leftOffset, getEndingCell(column, i));
      if (!column._span) {
        self.processNode(column);
      } else if (column._columnEndingContext) {
        // row-span ending
        self.writer.context().markEnding(column);
      }
    }

    self.writer.context().completeColumnGroup();
  });

  return pageBreaks;

  function storePageBreakData(data) {
    var pageDesc;

    for(var i = 0, l = pageBreaks.length; i < l; i++) {
      var desc = pageBreaks[i];
      if (desc.prevPage === data.prevPage) {
        pageDesc = desc;
        break;
      }
    }

    if (!pageDesc) {
      pageDesc = data;
      pageBreaks.push(pageDesc);
    }
    pageDesc.prevY = Math.max(pageDesc.prevY, data.prevY);
    pageDesc.y = Math.min(pageDesc.y, data.y);
  }

	function colLeftOffset(i) {
		if (gaps && gaps.length > i) return gaps[i];
		return 0;
	}

  function getEndingCell(column, columnIndex) {
    if (column.rowSpan && column.rowSpan > 1) {
      var endingRow = tableRow + column.rowSpan - 1;
      if (endingRow >= tableBody.length) throw 'Row span for column ' + columnIndex + ' (with indexes starting from 0) exceeded row count';
      return tableBody[endingRow][columnIndex];
    }

    return null;
  }
};

// lists
LayoutBuilder.prototype.processList = function(orderedList, items, gapSize) {
	var self = this;

	this.writer.context().addMargin(gapSize.width);

	var nextMarker;
	this.tracker.auto('lineAdded', addMarkerToFirstLeaf, function() {
		items.forEach(function(item) {
			nextMarker = item.listMarker;
			self.processNode(item);
		});
	});

	this.writer.context().addMargin(-gapSize.width);

	function addMarkerToFirstLeaf(line) {
		// I'm not very happy with the way list processing is implemented
		// (both code and algorithm should be rethinked)
		if (nextMarker) {
			var marker = nextMarker;
			nextMarker = null;

			if (marker.canvas) {
				var vector = marker.canvas[0];

				offsetVector(vector, -marker._minWidth, 0);
				self.writer.addVector(vector);
			} else {
				var markerLine = new Line(self.pageSize.width);
				markerLine.addInline(marker._inlines[0]);
				markerLine.x = -marker._minWidth;
				markerLine.y = line.getAscenderHeight() - markerLine.getAscenderHeight();
				self.writer.addLine(markerLine, true);
			}
		}
	}
};

// tables
LayoutBuilder.prototype.processTable = function(tableNode) {
  var processor = new TableProcessor(tableNode);

  processor.beginTable(this.writer);

  for(var i = 0, l = tableNode.table.body.length; i < l; i++) {
    processor.beginRow(i, this.writer);

    var pageBreaks = this.processRow(tableNode.table.body[i], tableNode.table.widths, tableNode._offsets.offsets, tableNode.table.body, i);

    processor.endRow(i, this.writer, pageBreaks);
  }

  processor.endTable(this.writer);
};

// leafs (texts)
LayoutBuilder.prototype.processLeaf = function(node) {
	var line = this.buildNextLine(node);

	while (line) {
		this.writer.addLine(line);
		line = this.buildNextLine(node);
	}
};

LayoutBuilder.prototype.buildNextLine = function(textNode) {
	if (!textNode._inlines || textNode._inlines.length === 0) return null;

	var line = new Line(this.writer.context().availableWidth);

	while(textNode._inlines && textNode._inlines.length > 0 && line.hasEnoughSpaceForInline(textNode._inlines[0])) {
		line.addInline(textNode._inlines.shift());
	}

	line.lastLineInParagraph = textNode._inlines.length === 0;
	return line;
};

// images
LayoutBuilder.prototype.processImage = function(node) {
    this.writer.addImage(node);
};

LayoutBuilder.prototype.processCanvas = function(node) {
	var height = node._minHeight;

	if (this.writer.context().availableHeight < height) {
		// TODO: support for canvas larger than a page
		// TODO: support for other overflow methods

		this.writer.moveToNextPage();
	}

	node.canvas.forEach(function(vector) {
		this.writer.addVector(vector);
	}, this);

	this.writer.context().moveDown(height);
};


module.exports = LayoutBuilder;
