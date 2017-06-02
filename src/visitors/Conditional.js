// @flow

import parseExpression from '../utils/parse-expression';
import type Context from '../context';
import t from '../babel-types';
import {visitExpression} from '../visitors';

// [ "JSXExpressionContainer", "ConditionalExpression", "IfStatement" ]


const ConditionalVisitor = {
  expression(node: Object, context: Context): Expression {
    if (node.alternate && node.alternate.type === 'Conditional') {
      node.alternate = {nodes: [node.alternate]};
    }
    const test = parseExpression(node.test, context);

    const consequent = context.staticBlock((childContext: Context): Expression => {
      const children = node.consequent.nodes.map(node => visitExpression(node, childContext));
      if (children.length === 1) {
        return children[0];
      }
      if (children.length === 0) {
        return t.identifier('undefined');
      }
      return t.arrayExpression(children);
    });
    const alternate = context.staticBlock((childContext: Context): Expression => {
      const children = (
        node.alternate
          ? (node.alternate.type === 'Conditional' ? [node.alternate] : node.alternate.nodes)
          : []
      ).map(node => visitExpression(node, childContext));
      if (children.length === 1) {
        return children[0];
      }
      if (children.length === 0) {
        return t.identifier('undefined');
      }
      return t.arrayExpression(children);
    });

    return t.conditionalExpression(
      test,
      consequent,
      alternate,
    );
  },
};
export default ConditionalVisitor;
