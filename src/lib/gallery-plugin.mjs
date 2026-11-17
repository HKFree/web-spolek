import { defineHastPlugin } from 'satteri';

// Odstavec, který obsahuje jen obrázky (aspoň dva), se vykreslí jako galerie.
// Redaktor tak nemusí psát HTML: stačí vložit obrázky pod sebe bez textu.
const isBlank = (node) => node.type === 'text' && !node.value.trim();
const isTag = (node, tag) => node.type === 'element' && node.tagName === tag;

export default defineHastPlugin({
  name: 'hkfree-gallery',
  element: {
    filter: ['p'],
    visit(node, ctx) {
      const images = node.children.filter((child) => isTag(child, 'img'));
      if (images.length < 2) return;
      if (!node.children.every((child) => isTag(child, 'img') || isTag(child, 'br') || isBlank(child))) return;
      ctx.replaceNode(node, { type: 'element', tagName: 'div', properties: { className: ['gallery'] }, children: images });
    },
  },
});
