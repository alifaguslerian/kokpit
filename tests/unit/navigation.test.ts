import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { navItems } from '../../src/components/layout/BottomNavigation';
import { routes } from '../../src/app/routes';
import { cn } from '../../src/lib/cn';

describe('App Shell & Navigation Unit Tests', () => {
  describe('Navigation Configuration', () => {
    test('defines all 6 canonical V1 navigation destinations', () => {
      const paths = navItems.map((item) => item.path);
      const labels = navItems.map((item) => item.label);

      assert.deepStrictEqual(paths, ['/home', '/college', '/music', '/news', '/ideas', '/library']);

      assert.deepStrictEqual(labels, ['Home', 'College', 'Music', 'News', 'Ideas', 'Library']);
    });

    test('router config contains root and all 6 children routes', () => {
      assert.ok(routes.length > 0);
      const rootRoute = routes[0];
      assert.ok(rootRoute);
      assert.strictEqual(rootRoute.path, '/');
      assert.ok(rootRoute.children);

      const childPaths = rootRoute.children.map((c) => c.path ?? 'index');
      assert.ok(childPaths.includes('home'));
      assert.ok(childPaths.includes('college'));
      assert.ok(childPaths.includes('music'));
      assert.ok(childPaths.includes('news'));
      assert.ok(childPaths.includes('ideas'));
      assert.ok(childPaths.includes('library'));
    });
  });

  describe('Classnames Helper (cn)', () => {
    test('joins string classes and ignores falsy values', () => {
      const result = cn('base-class', false, null, undefined, 'active-class');
      assert.strictEqual(result, 'base-class active-class');
    });

    test('evaluates object boolean conditionals correctly', () => {
      const result = cn('base', { active: true, disabled: false, selected: true });
      assert.strictEqual(result, 'base active selected');
    });
  });
});
