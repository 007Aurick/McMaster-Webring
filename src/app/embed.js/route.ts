/**
 * <script src="https://www.mcmasterwebring.com/embed.js" data-user="your-id"></script>
 *
 * Optional attributes:
 *   data-ring     mac (default, everyone) | faculty (only your faculty's ring)
 *   data-color    any CSS colour (default McMaster maroon)
 *   data-size     logo size in px (default 32)
 *   data-caption  off  hides the "Next: ..., building ..." line
 *
 * The arrows are real links to /go, so they work before the API answers.
 * The caption fills in once it does.
 */
const script = `(function () {
  var s = document.currentScript || document.querySelector('script[src*="/embed.js"][data-user]');
  if (!s) return;
  var BASE = new URL(s.src, location.href).origin;
  var user = s.getAttribute('data-user') || '';
  var ring = s.getAttribute('data-ring') === 'faculty' ? 'faculty' : 'mac';
  var color = s.getAttribute('data-color') || '#ad1229';
  var size = parseInt(s.getAttribute('data-size') || '32', 10) || 32;
  var showCaption = s.getAttribute('data-caption') !== 'off';
  var mark = '<img src="' + BASE + '/flame.png" alt="" width="' + size + '" height="' + size + '" style="display:block">';

  function go(dir) {
    return BASE + '/go?from=' + encodeURIComponent(user) + '&to=' + dir + (ring === 'faculty' ? '&ring=faculty' : '');
  }
  function link(href, html, label) {
    var a = document.createElement('a');
    a.href = href; a.innerHTML = html; a.title = label; a.setAttribute('aria-label', label);
    a.style.cssText = 'color:inherit;text-decoration:none;display:inline-flex;align-items:center;line-height:1;transition:transform .15s;';
    a.onmouseenter = function () { a.style.transform = 'scale(1.12)'; };
    a.onmouseleave = function () { a.style.transform = ''; };
    return a;
  }

  var box = document.createElement('nav');
  box.className = 'mcmaster-webring';
  box.setAttribute('aria-label', 'McMaster webring');
  box.style.cssText = 'display:inline-flex;align-items:center;gap:' + Math.round(size / 3) + 'px;color:' + color + ';font:600 ' + Math.round(size * 0.6) + 'px/1 system-ui,-apple-system,sans-serif;';

  var prev = link(go('prev'), '&larr;', 'Previous site in the McMaster webring');
  var home = link(BASE + (user ? '/?ref=' + encodeURIComponent(user) : ''), mark, 'McMaster Webring');
  var next = link(go('next'), '&rarr;', 'Next site in the McMaster webring');
  box.appendChild(prev); box.appendChild(home); box.appendChild(next);

  var caption = document.createElement('a');
  caption.href = go('next');
  caption.style.cssText = 'display:none;flex-direction:column;gap:3px;max-width:240px;margin-left:4px;color:inherit;text-decoration:none;font:500 13px/1.25 system-ui,-apple-system,sans-serif;';
  box.appendChild(caption);
  s.parentNode.insertBefore(box, s.nextSibling);

  if (!user) return;
  fetch(BASE + '/api/webring?user=' + encodeURIComponent(user) + '&ring=' + ring)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.found) { console.warn('[mcmaster.network] "' + user + '" is not in members.ts yet'); return; }
      prev.title = 'Previous: ' + d.prev.name;
      next.title = 'Next: ' + d.next.name;
      if (!showCaption || d.next.id === user) return;
      var top = document.createElement('span');
      top.textContent = 'Next: ' + d.next.name;
      top.style.cssText = 'font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      caption.appendChild(top);
      if (d.next.building) {
        var sub = document.createElement('span');
        sub.textContent = 'building ' + d.next.building;
        sub.style.cssText = 'opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
        caption.appendChild(sub);
      }
      caption.style.display = 'inline-flex';
    })
    .catch(function () {});
})();`;

export function GET() {
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
