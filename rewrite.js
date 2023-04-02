let rewriteScript = (
    repo
) => `//Auto generated script for replacing relativr asset URLs with github raw URLs
//since stackblitz free plan doesn't support assets.
{
  let baseURL = 'https://raw.githubusercontent.com/${repo}/main/';
  let newURL = (elt) => {
    let url = elt.getAttribute('src');
    if (!url.includes('https://')) {
      elt.setAttribute('src', baseURL + url);
    }
  };

  document.querySelectorAll('img,audio').forEach(newURL);

  const targetNode = document.body;
  const observerOptions = {
    attributes: true,
    subtree: true,
  };

  const observer = new MutationObserver((mutation) => {
    mutation.forEach((mu) => {
      if (mu.attributeName == 'src' && mu.target.matches('img,audio')) {
        newURL(mu.target);
      }
    });
  });
  observer.observe(targetNode, observerOptions);
}
`;