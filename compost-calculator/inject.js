// Calculadora de Composta (inject content)
if (window.location.search === '?page_id=718&preview=true') {
  window.addEventListener('load', () => {
    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.minHeight = '200vh';
    iframe.style.overflow = 'hidden';
    iframe.scrolling = 'no';
    iframe.onload = 'this.style.height=this.contentWindow.document.body.scrollHeight + "px";';
    iframe.srcdoc = "${data}";
    setInterval(() => {
      iframe.style.height = (iframe.contentWindow.document.body.scrollHeight + 50) + 'px';
    }, 1000);

    const el = document.getElementById('main');
    el.style.padding = '0';
    el.appendChild(iframe);
  });
}