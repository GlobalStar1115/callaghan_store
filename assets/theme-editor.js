function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach(modal => modal.hide());
}

document.addEventListener('shopify:block:select', function(event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function() {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function(event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});

document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());


//
function init() {
  cacheSelectors();
  $(selectors.siteNavHasDropdown).on('mouseenter', function() {
    	var $el = $(this);
  	showDropdown($el);
  });
  $('.site-nav__dropdown').on('mouseenter', function() {
  	$(this).show();
    	$(this).parent().addClass(config.activeClass);
  });
  $(selectors.siteNavHasDropdown).on('mouseleave', function() {
  	hideDropdown(cache.$activeDropdown);
  });
  $('.site-nav__dropdown').on('mouseleave', function() {
    	hideDropdown(cache.$activeDropdown);
    	$(this).hide();
  });
  cache.$subMenuLinks.on('click.siteNav', function(evt) {
    // Prevent click on body from firing instead of link
    evt.stopImmediatePropagation();
  });
}
function showDropdown($el) {
  $el.addClass(config.activeClass);
  var headerHeight = $('#shopify-section-header').outerHeight(),
      headerNav = $el.find('.site-nav__dropdown').outerHeight();
  $el.find('.site-nav__dropdown').css({top: +headerHeight+ 'px'});
  cache.$activeDropdown = $el;
}
function hideDropdown($el) {
  // remove aria on open dropdown
  $el.removeClass(config.activeClass);
  // reset active dropdown
  cache.$activeDropdown = $(selectors.siteNavActiveDropdown);
  $(selectors.body).off('click.siteNav');
  $(window).off('keyup.siteNav');
}
