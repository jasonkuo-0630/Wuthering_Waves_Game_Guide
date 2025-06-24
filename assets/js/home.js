const scrollHint = document.getElementById('scrollHint');
const secondPage = document.querySelector('.home-page-guide');

if (scrollHint && secondPage) {
  scrollHint.addEventListener('click', () => {
    secondPage.scrollIntoView({ behavior: 'smooth' });
  });
}

// 滾動時自動隱藏探索提示
const scrollContainer = document.querySelector('.scroll-container');

if (scrollContainer && scrollHint) {
  scrollContainer.addEventListener('scroll', () => {
    if (scrollContainer.scrollTop > window.innerHeight * 0.5) {
      scrollHint.classList.add('scroll-hint-side-hidden');
    } else {
      scrollHint.classList.remove('scroll-hint-side-hidden');
    }
  });
}