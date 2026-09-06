import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) check(path);
    else if (/\.[jt]sx$/.test(path)) {
      const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      let count = 0;
      function visit(node) {
        if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) count++;
        ts.forEachChild(node, visit);
      }
      visit(source);
      if (count > 1) { console.error(path + ': TSX内の関数が' + count + '個あります'); process.exitCode = 1; }
    }
  }
}
check('src');
