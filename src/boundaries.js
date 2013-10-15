/* boundaries.js is part of Aloha Editor project http://aloha-editor.org
 *
 * Aloha Editor is a WYSIWYG HTML5 inline editing library and editor.
 * Copyright (c) 2010-2013 Gentics Software GmbH, Vienna, Austria.
 * Contributors http://aloha-editor.org/contribution.php
 */
define([
	'dom'
], function Boundaries(
	dom
) {
	'use strict';

	if ('undefined' !== typeof mandox) {
		eval(uate)('boundaries');
	}

	function equal(a, b) {
		return a[0] === b[0] && a[1] === b[1];
	}

	function start(range) {
		return [range.startContainer, range.startOffset];
	}

	function end(range) {
		return [range.endContainer, range.endOffset];
	}

	/**
	 *	<div>
	 *		foo
	 *		<p>
	 *			bar
	 *			<b>
	 *				<u></u>
	 *				baz
	 *			</b>
	 *		</p>
	 *	</div>
	 *
	 *	|foo|<p>|bar|<b>|<u>|</u>|baz|<b>|</p>|
	 */
	function prev(boundary) {
		var node = boundary[0];
		var offset = boundary[1];

		// <p>[foo</p>
		// <p>fo[o</p>
		// <p>foo[</p>
		// ==
		// <p>{foo</p>
		//
		// <p>{<p> ==> {<p></p>
		if (0 === offset || dom.isTextNode(node)) {
			return [node.parentNode, dom.nodeIndex(node)];
		}

		// <p>foo{</p> ==> <p>{foo</p>
		// <p><b>foo</b>bar{</p> ==> <p><b>foo</b>{foo</p>
		// <p><b><b>{</p> ==> <p><b>{</b></p>
		// <p><b></b>{foo</p> ==> <p><b>{</b>foo</p>
		// <p><b>foo</b>{bar</p> ==> <p><b>foo{</b>bar</p>
		// <p>foo{<b></b></p> ==> <p>{foo<b></b></p>
		node = node.childNodes[offset - 1];

		return (dom.isTextNode(node) || dom.isVoidNode(node))
		     ? [node.parentNode, dom.nodeIndex(node)]
		     : [node, dom.nodeLength(node)];
	}

	function next(boundary) {
		var node = boundary[0];
		var offset = boundary[1];

		// <p>[foo</p>
		// <p>fo[o</p>
		// <p>foo[</p>
		// ==
		// <p>foo{</p>
		//
		// <p><b>foo{</b></p> ==> <p><b>foo</b>{</p>
		// <p><b>{</b></p> ==> <p><b></b>{</p>
		if (dom.isTextNode(node) || dom.nodeLength(node) === offset) {
			return [node.parentNode, dom.nodeIndex(node) + 1];
		}

		// <p>{foo</p> ==> <p>foo{</p>
		// <p>{<b>foo</b></p> ==> <p><b>{foo</b></p>
		node = node.childNodes[offset];

		return (dom.isTextNode(node) || dom.isVoidNode(node))
		     ? [node.parentNode, offset + 1]
		     : [node, 0];
	}

	function stepWhile(boundary, cond, step) {
		var pos = boundary;
		while (cond(pos, pos[0], pos[1])) {
			pos = step(pos);
		}
		return pos;
	}

	function nextWhile(boundary, cond) {
		return stepWhile(boundary, cond, next);
	}

	function prevWhile(boundary, cond) {
		return stepWhile(boundary, cond, prev);
	}

	/**
	 * Returns node that is right adjacent to the given boundary.
	 *
	 * @param {Array.<Element, number>} boundary
	 * @return {Element}
	 */
	function leftNode(boundary) {
		var node = boundary[0];
		var offset = boundary[1];
		return (0 === offset) ? node : dom.nodeAtOffset(node, offset - 1);
	}

	/**
	 * Returns node that is left adjacent to the given boundary.
	 *
	 * @param {Array.<Element, number>} boundary
	 * @return {Element}
	 */
	function rightNode(boundary) {
		var node = boundary[0];
		var offset = boundary[1];
		return (dom.nodeLength(node) === offset)
		     ? node
		     : dom.nodeAtOffset(node, offset);
	}

	function atEnd(boundary) {
		 return boundary[1] === dom.nodeLength(boundary[0]);
	}

	function atStart(boundary) {
		return 0 === boundary[1];
	}

	var exports = {
		equal     : equal,
		start     : start,
		end       : end,
		next      : next,
		prev      : prev,
		nextWhile : nextWhile,
		prevWhile : prevWhile,
		leftNode  : leftNode,
		rightNode : rightNode,
		atStart   : atStart,
		atEnd     : atEnd
	};

	exports['equal']     = exports.equal;
	exports['start']     = exports.start;
	exports['end']       = exports.end;
	exports['next']      = exports.next;
	exports['prev']      = exports.prev;
	exports['nextWhile'] = exports.nextWhile;
	exports['prevWhile'] = exports.prevWhile;
	exports['leftNode']  = exports.leftNode;
	exports['rightNode'] = exports.rightNode;

	return exports;
});
