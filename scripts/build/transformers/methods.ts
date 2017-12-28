import * as ts from 'typescript';
import { convertValueToLiteral, getDecorator, getDecoratorArgs, getDecoratorName, getMethodsForDecorator } from '../helpers';

export function transformMethod(method: ts.MethodDeclaration) {
  if (!method) return;

  const decorator = getDecorator(method),
    decoratorName = getDecoratorName(decorator),
    decoratorArgs = getDecoratorArgs(decorator);

  try {
    return ts.createMethod(undefined, undefined, undefined, method.name, undefined, method.typeParameters, method.parameters, method.type, ts.createBlock([
      ts.createReturn(
        getMethodBlock(method, decoratorName, decoratorArgs)
      )
    ]));
  } catch (e) {
    console.log('Error transforming method: ', (method.name as any).text);
    console.log(e.message);
  }
}

function getMethodBlock(method: ts.MethodDeclaration, decoratorName: string, decoratorArgs: any): ts.Expression {
  const decoratorMethod = getMethodsForDecorator(decoratorName)[0];

  switch (decoratorName) {
    case 'CordovaCheck':
    case 'InstanceCheck':
      return ts.createImmediatelyInvokedFunctionExpression([ts.createIf(
        ts.createBinary(
          ts.createCall(ts.createIdentifier(decoratorMethod), undefined, [ts.createThis()]),
          ts.SyntaxKind.EqualsEqualsEqualsToken,
          ts.createTrue()
        ),
        method.body
      )]);

    default:
      return ts.createCall(ts.createIdentifier(decoratorMethod), undefined, [
        ts.createThis(),
        ts.createLiteral((method.name as any).text),
        convertValueToLiteral(decoratorArgs),
        ts.createIdentifier('arguments')
      ]);
  }

}
