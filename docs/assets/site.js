/* ================================================================
   Docker 教程 · 共享脚本：侧边栏、目录、代码高亮、主题
   ================================================================ */
(function () {
  'use strict';

  var CHAPTERS = [
    { n: 1,  t: '容器的前世今生',        d: '从“一台服务器一个应用”到容器', part: '第一部分 · 大局观' },
    { n: 2,  t: 'Docker 与容器标准',     d: 'Docker 公司、OCI、CNCF 与 Moby' },
    { n: 3,  t: '安装 Docker',           d: 'Docker Desktop、Linux 与虚拟机' },
    { n: 4,  t: '第一次上手',            d: '运维视角与开发视角各走一遍' },
    { n: 5,  t: 'Docker 引擎',           d: 'dockerd、containerd、shim 与 runc', part: '第二部分 · 核心技术' },
    { n: 6,  t: '镜像',                  d: '分层、标签、摘要与多架构' },
    { n: 7,  t: '容器',                  d: '生命周期、exec、调试与重启策略' },
    { n: 8,  t: '应用容器化',            d: 'Dockerfile、多阶段构建与构建缓存' },
    { n: 9,  t: 'Compose 多容器应用',    d: '用一个 YAML 文件管理整套应用' },
    { n: 10, t: 'Docker 与 AI',          d: 'Model Runner：在本地跑大模型', part: '第三部分 · 新领域' },
    { n: 11, t: 'Docker 与 Wasm',        d: 'WebAssembly 容器（已弃用，了解即可）' },
    { n: 12, t: 'Docker Swarm',          d: '集群、服务、期望状态与滚动更新', part: '第四部分 · 编排与网络' },
    { n: 13, t: 'Docker 网络',           d: 'CNM、bridge、端口映射与服务发现' },
    { n: 14, t: 'Overlay 网络',          d: '跨主机容器网络与 VXLAN' },
    { n: 15, t: '卷与持久化数据',        d: '卷、绑定挂载与 tmpfs', part: '第五部分 · 数据与安全' },
    { n: 16, t: 'Docker 安全',           d: '命名空间、cgroups、签名与机密' },
    { n: 17, t: '排错实战',              d: '症状 → 排查命令 → 常见原因', part: '第六部分 · 实战' },
    { n: 18, t: '用容器搭开发环境',      d: 'Compose、热更新与 Dev Containers' },
    { n: 19, t: 'CI/CD 流水线',          d: 'GitHub Actions 构建、扫描、签名、推送' },
    { n: 20, t: '部署到服务器',          d: '反向代理、HTTPS、远程上下文与回滚' },
    { n: 21, t: '按语言写 Dockerfile',   d: 'Node、Python、Go、Java 生产级模板' },
    { n: 22, t: '镜像瘦身实战',          d: '实测：从 1.27 GB 到 68 MB，漏洞从 3454 到 0' },
    { n: 23, t: '下一步与术语表',        d: '学习路线、命令速查与术语', part: '附录' }
  ];

  var cur = parseInt(document.body.dataset.chapter || '0', 10);

  /* ---------- 侧边栏 ---------- */
  var side = document.getElementById('sidebar');
  if (side) {
    var html = '<a class="brand" href="index.html"><span class="flame">&#128051;</span>' +
      '<span>Docker 从零到精通<small>基于 2026 年 9 月的最新版本</small></span></a>';
    CHAPTERS.forEach(function (c) {
      if (c.part) html += '<div class="part">' + c.part + '</div>';
      html += '<a class="ch' + (c.n === cur ? ' active' : '') + '" href="ch' +
        pad(c.n) + '.html"><span class="n">' + c.n + '</span><span>' + c.t + '</span></a>';
    });
    side.innerHTML = html;
    var active = side.querySelector('a.ch.active');
    if (active) setTimeout(function () {
      active.scrollIntoView({ block: 'center' });
    }, 0);
  }

  /* ---------- 移动端菜单 ---------- */
  var btn = document.createElement('button');
  btn.id = 'menu-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '目录');
  btn.innerHTML = '&#9776;';
  btn.onclick = function () { document.body.classList.toggle('nav-open'); };
  document.body.appendChild(btn);
  document.addEventListener('click', function (e) {
    if (document.body.classList.contains('nav-open') &&
        side && !side.contains(e.target) && e.target !== btn) {
      document.body.classList.remove('nav-open');
    }
  });

  /* ---------- 主题切换 ---------- */
  var tbtn = document.createElement('button');
  tbtn.id = 'theme-btn';
  tbtn.type = 'button';
  tbtn.setAttribute('aria-label', '切换深浅色');
  tbtn.innerHTML = '&#9789;';
  tbtn.onclick = function () {
    var root = document.documentElement;
    var now = root.getAttribute('data-theme');
    var dark = now ? now === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    try { localStorage.setItem('docker-doc-theme', dark ? 'light' : 'dark'); } catch (e) {}
  };
  document.body.appendChild(tbtn);
  try {
    var saved = localStorage.getItem('docker-doc-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) {}

  /* ---------- 箭头 marker（全局一次） ---------- */
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('style', 'position:absolute');
  // SVG marker 的内容不会从引用它的元素继承 color，所以直接用 CSS 变量填色。
  defs.innerHTML =
    '<defs>' +
    '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--fg-faint)"/></marker>' +
    '<marker id="ar-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker>' +
    '<marker id="ar-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--blue)"/></marker>' +
    '<marker id="ar-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--green)"/></marker>' +
    '<marker id="ar-r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--red)"/></marker>' +
    '<marker id="ar-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="var(--purple)"/></marker>' +
    '</defs>';
  document.body.appendChild(defs);

  /* ---------- 章节内目录 ---------- */
  var main = document.querySelector('main');
  var slot = document.getElementById('chapter-toc');
  if (slot && main) {
    var hs = main.querySelectorAll('h2');
    if (hs.length > 2) {
      var t = '<div class="h">本章目录</div><ol>';
      hs.forEach(function (h, i) {
        if (!h.id) h.id = 'sec-' + (i + 1);
        t += '<li><a href="#' + h.id + '">' + h.textContent + '</a></li>';
      });
      slot.className = 'toc';
      slot.innerHTML = t + '</ol>';
    }
  }

  /* ---------- 代码块：语言标签 + 复制 + 高亮 ---------- */
  var KW = ('const|let|var|function|return|if|else|await|async|import|from|export|default|new|class|' +
    'for|while|of|in|do|try|catch|finally|throw|def|with|as|' +
    'null|undefined|true|false|None|True|False|this|package|func|fn|use|pub|impl|struct|mut|match').split('|');

  var RE_CODE = new RegExp(
    '(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*|#(?!!)[^\\n]*)' +                                             // 1 注释
    '|(`(?:\\\\[\\s\\S]|[^\\\\`])*`|\'(?:\\\\[\\s\\S]|[^\\\\\'])*\'|"(?:\\\\[\\s\\S]|[^\\\\"])*")' +     // 2 字符串
    '|\\b(' + KW.join('|') + ')\\b' +                                                                     // 3 关键字
    '|\\b([A-Z][A-Za-z0-9_]*)\\b' +                                                                       // 4 类型/构造器
    '|\\b(\\d+(?:\\.\\d+)?)\\b' +                                                                         // 5 数字
    '|\\b([a-zA-Z_$][\\w$]*)(?=\\()',                                                                     // 6 函数调用
    'g');

  // Shell：注释、字符串、常见命令、--参数
  var RE_SH = /(^\s*#[^\n]*|\s#\s[^\n]*)|('(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*")|(^\$ |^PS> )|(?<![\w.\/-])(docker-compose|docker|sudo|git|cd|mkdir|curl|export|unset|apt-get|apt|apk|systemctl|multipass|spin|rustup|cat|ls|echo|ping|ip|jq|grep|cosign|openssl|kubectl|trivy|printf|tar)(?![\w.\/-])|(\s--?[a-zA-Z][\w-]*)/gm;

  // Dockerfile：注释、字符串、指令、--参数、${变量}
  var RE_DF = /(^\s*#[^\n]*)|('(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*")|(^\s*(?:FROM|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b|\bAS\b)|(--[a-z][\w-]*(?:=[^\s\\]*)?)|(\$\{?[A-Za-z_][\w]*\}?)/gm;

  // YAML：注释、字符串、键名、数字/布尔
  var RE_YAML = /(^\s*#[^\n]*|\s#\s[^\n]*)|('(?:[^'])*'|"(?:\\[\s\S]|[^\\"])*")|(^\s*-?\s*[\w.\-\/]+(?=:(?:\s|$)))|\b(true|false|yes|no|null|\d+(?:\.\d+)?[a-z]*)\b|(\$\{[^}]+\})/gm;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function paint(src, re, classes) {
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      for (var g = 1; g < m.length; g++) {
        if (m[g] !== undefined) { out += '<span class="' + classes[g - 1] + '">' + esc(m[g]) + '</span>'; break; }
      }
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    return out + esc(src.slice(last));
  }

  document.querySelectorAll('.code').forEach(function (box) {
    var pre = box.querySelector('pre');
    if (!pre) return;
    var lang = box.dataset.lang || '';
    var file = box.dataset.file || '';
    var bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML = '<span class="tag">' + esc(file || lang || 'code') + '</span>';
    var cp = document.createElement('button');
    cp.className = 'copy'; cp.type = 'button'; cp.textContent = '复制';
    cp.onclick = function () {
      var txt = pre.textContent;
      // 复制 shell 命令时：只保留以 "$ " 开头的命令行（及其 \ 续行），并去掉提示符
      if ((lang === 'bash' || lang === 'sh' || lang === 'shell') && /^\$ /m.test(txt)) {
        var keep = [], cont = false, heredoc = null;
        txt.split('\n').forEach(function (l) {
          if (heredoc) { keep.push(l); if (l.trim() === heredoc) heredoc = null; return; }
          if (/^\$ /.test(l)) { l = l.slice(2); keep.push(l); }
          else if (cont) { keep.push(l); }
          else return;
          cont = /\\\s*$/.test(l);
          var h = l.match(/<<-?\s*['"]?(\w+)['"]?/);
          if (h) heredoc = h[1];
        });
        txt = keep.join('\n');
      }
      if (navigator.clipboard) navigator.clipboard.writeText(txt);
      cp.textContent = '已复制'; setTimeout(function () { cp.textContent = '复制'; }, 1400);
    };
    bar.appendChild(cp);
    box.insertBefore(bar, pre);

    var code = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
      pre.innerHTML = paint(code, RE_SH, ['tk-cm', 'tk-st', 'tk-cm', 'tk-kw', 'tk-fn']);
    } else if (lang === 'dockerfile' || lang === 'Dockerfile') {
      pre.innerHTML = paint(code, RE_DF, ['tk-cm', 'tk-st', 'tk-kw', 'tk-fn', 'tk-nm']);
    } else if (lang === 'yaml' || lang === 'yml') {
      pre.innerHTML = paint(code, RE_YAML, ['tk-cm', 'tk-st', 'tk-kw', 'tk-nm', 'tk-tp']);
    } else if (lang === 'text' || lang === 'output' || lang === 'toml' || lang === 'env') {
      pre.innerHTML = esc(code);
    } else {
      pre.innerHTML = paint(code, RE_CODE, ['tk-cm', 'tk-st', 'tk-kw', 'tk-tp', 'tk-nm', 'tk-fn']);
    }
  });

  /* ---------- 上一章 / 下一章 ---------- */
  var pager = document.getElementById('pager');
  if (pager && cur) {
    var prev = CHAPTERS.find(function (c) { return c.n === cur - 1; });
    var next = CHAPTERS.find(function (c) { return c.n === cur + 1; });
    var h = '';
    h += prev ? '<a class="prev" href="ch' + pad(prev.n) + '.html"><span>&larr; 上一章</span>第 ' + prev.n + ' 章 · ' + prev.t + '</a>'
              : '<a class="prev" href="index.html"><span>&larr; 返回</span>课程首页</a>';
    h += next ? '<a class="next" href="ch' + pad(next.n) + '.html"><span>下一章 &rarr;</span>第 ' + next.n + ' 章 · ' + next.t + '</a>'
              : '<a class="next" href="index.html"><span>完成 &#127881;</span>回到课程首页</a>';
    pager.className = 'pager';
    pager.innerHTML = h;
  }

  /* ---------- 首页目录 ---------- */
  var grid = document.getElementById('toc-grid');
  if (grid) {
    var g = '';
    CHAPTERS.forEach(function (c) {
      g += '<a class="toc-card" href="ch' + pad(c.n) + '.html">' +
        '<div class="n">' + (c.part === '附录' ? '附录' : '第 ' + c.n + ' 章') + '</div>' +
        '<div class="t">' + c.t + '</div>' +
        '<div class="d">' + c.d + '</div></a>';
    });
    grid.className = 'toc-grid';
    grid.innerHTML = g;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
})();
