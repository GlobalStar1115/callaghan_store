if (typeof boostPFSThemeConfig !== 'undefined') {
  // Override Settings
  var boostPFSFilterConfig = {
    general: {
      limit: boostPFSConfig.custom.products_per_page,
      loadProductFirst: true,
      numberFilterTree: 2,
      selectOptionContainer: '.grid__item .card-wrapper',
      stickyFixTopPos: true
    },
    selector: {
      otpTopCartCount: '.cart-count-bubble'
    }
  };
}

(function () {
  var onSale = false,
    soldOut = false,
    priceVaries = false,
    images = [],
    boostPFSRangeWidths = [165, 360, 533, 720, 940, 1066];


  BoostPFS.inject(this);
  /* For Filter Setting Layout */
  Selector.stickyElementDesktop = jQ('.boost-pfs-filter-left-col').length > 0 && !Utils.isMobile() ? '.boost-pfs-filter-left-col' : '.boost-pfs-filter-tree';
  /************************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
  function prepareShopifyData(data) {
    // Displaying price base on the policy of Shopify, have to multiple by 100
    soldOut = !data.available; // Check a product is out of stock
    onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Convert images to array
    images = data.images_info;
    // Get First Variant (selected_or_first_available_variant)
    firstVariant = data['variants'][0];
    if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
      var paramVariant = data.variants.filter(function (e) {
        return e.id == Utils.getParam('variant');
      });
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
      for (var i = 0; i < data['variants'].length; i++) {
        if (data['variants'][i].available) {
          firstVariant = data['variants'][i];
          break;
        }
      }
    }
    return data;
  }

  /************************** END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/
  /************************** BUILD PRODUCT LIST **************************/
  // Build Product Grid Item
  ProductGridItem.prototype.compileTemplate = function (data) {
    if (!data) data = this.data;
    // Customize API data to get the Shopify data
    data = prepareShopifyData(data);

    // Get Template
    var itemHtml = boostPFSTemplate.productGridItemHtml;
    // Add Custom class
    var soldOutClass = soldOut ? boostPFSTemplate.soldOutClass : '';
    var saleClass = onSale ? boostPFSTemplate.saleClass : '';
    var ratioImage = getRatioImage(data);
    var imageAspectRatio = ratioImage / getAspectRatio(data.images_info[0]) * 100;

    itemHtml = itemHtml.replace(/{{imageAspectRatio}}/g, imageAspectRatio);
      
    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass);


    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass);

    // Add Card product class
    itemHtml = itemHtml.replace(/{{cardProductClass}}/g, buildCardProductClass(data));
    // Add Card inner product class
    itemHtml = itemHtml.replace(/{{cardInnerProductClass}}/g, buildCardInnerProductClass(data));
    // Add Card badge position
    itemHtml = itemHtml.replace(/{{cardBadgePosition}}/g, boostPFSThemeConfig.custom.badge_position);
    // Add check card heading five
    itemHtml = itemHtml.replace(/{{cardIsHeadingFive}}/g, buildCardIsHeadingFive(data));
    // Add sold out Label
    itemHtml = itemHtml.replace(/{{itemSoldOut}}/g, buildSoldOutLabel());
    // Add sale Label
    itemHtml = itemHtml.replace(/{{itemSale}}/g, buildSaleLabel());
    // Add Images
    itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImages(data));
    // Add Price
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, buildPrice(data));
    

    // Add Review
    if (typeof Integration === 'undefined' ||
      (typeof Integration != 'undefined' &&
        typeof Integration.hascompileTemplate == 'function' &&
        !Integration.hascompileTemplate('reviews'))) {
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, buildReview(data));
    }

    // Add Description
    itemHtml = itemHtml.replace(/{{itemDescription}}/g, boostPFSThemeConfig.custom.description || '');

    // Add Vendor
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, buildVendor(data));

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrlWithVariant(data));
    return itemHtml;
  };

  /************************** END BUILD PRODUCT LIST **************************/
  /************************** BUILD PRODUCT ITEM ELEMENTS **************************/
  function buildImages(data) {
    var html = '';
    if (images && Array.isArray(images) && images.length > 0) {
      html += '<div class="card__media">';
      var aspectRatio = '',
        rangeWidths = boostPFSRangeWidths;

      var dataSrcSet = '',
        imgAlt = data.title,
        flipImageSrcSet = '';

      var activeSwapImage = !Utils.isMobile() && images.length > 1 &&
        boostPFSThemeConfig.custom.hasOwnProperty('show_secondary_image') &&
        boostPFSThemeConfig.custom.show_secondary_image == true;

      for (var i = 0; i < rangeWidths.length; i++) {
        dataSrcSet += Utils.getFeaturedImage(images, rangeWidths[i] + 'x') + ' ' + rangeWidths[i] + 'w';

        if (activeSwapImage) {
          flipImageSrcSet += Utils.optimizeImage(images[1]['src'], rangeWidths[i] + 'x') + ' ' + rangeWidths[i] + 'w';
        }

        if (i < rangeWidths.length - 1) {
          dataSrcSet += ', ';

          if (activeSwapImage) {
            flipImageSrcSet += ', ';
          }
        }
      }

      aspectRatio = images[0]['width'] / images[0]['height'];
      html += '<div class="media media--transparent media--hover-effect"><img class="motion-reduce"' +
        'loading="lazy"' +
        'srcset="' + dataSrcSet + '" ' +
        'height="' + images[0].height + '" ' +
        'width="' + images[0].width + '" ' +
        'sizes="(min-width: 1100px) 535px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"' +
        'src="' + Utils.optimizeImage(images[0].src, '533x') + '" ' +
        'alt="' + imgAlt + '" />';

      if (activeSwapImage) {
        html += '<img class="motion-reduce"' +
        'loading="lazy"' +
        'srcset="' + flipImageSrcSet + '" ' +
        'height="' + images[1].height + '" ' +
        'width="' + images[1].width + '" ' +
        'sizes="(min-width: 1100px) 535px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"' +
        'src="' + Utils.optimizeImage(images[1].src, '533x') + '" ' +
        'alt="' + imgAlt + '" />';
      }
      html += '</div>';
      html += '</div>';
    } else {
      html += `<div class="card__content">
                <div class="card__information">
                  <h3 class="card__heading">
                    <a href="#" class="full-unstyled-link">
                      ${data.title}
                    </a>
                  </h3>
                </div>
              </div>`;
    }
    return html;
  }

  function buildCardProductClass(data) {
    var html = '' + boostPFSThemeConfig.custom.card_style;
    if (!images) {
      html += ' card--text';
    } else {
      html += ' card--media';
    }
    if (boostPFSThemeConfig.custom.card_style == 'card') {
      html += ' color-' + boostPFSThemeConfig.custom.card_color_scheme;
    }
    if (!images && boostPFSThemeConfig.custom.card_style == 'card') {
      html += ' ratio';
    }
    return html;
  }

  function buildCardInnerProductClass(data) {
    var html = '';
    if (boostPFSThemeConfig.custom.card_style == 'standard') {
      html += ' color-' + boostPFSThemeConfig.custom.card_color_scheme;
    }
    if (images || boostPFSThemeConfig.custom.card_style == 'standard') {
      html += ' ratio';
    }
    return html;
  }

  function buildCardIsHeadingFive(data) {
    var html = '';
    if (images || boostPFSThemeConfig.custom.card_style == 'standard') {
      html = 'h5';
    }
    return html;
  }

  function buildVendor(data) {
    var html = '';
    if (boostPFSThemeConfig.custom.hasOwnProperty('show_vendor') &&
      boostPFSThemeConfig.custom.show_vendor === true) {
      html = boostPFSTemplate.vendorHtml;
    }
    return html;
  }

  function buildPrice(data) {
    var html = '';
    var noComparePrice = data.price_varies === false && data.compare_at_price_varies;
    var priceAmount = boostPFSConfig.custom.currency_code_enabled ? Utils.formatMoney(data.price_min, 'money_with_currency') : Utils.formatMoney(data.price_min);
    var compareAtPrice = boostPFSConfig.custom.currency_code_enabled ? Utils.formatMoney(data.compare_at_price_min, 'money_with_currency') : Utils.formatMoney(data.compare_at_price_min);
    var moneyPrice = priceVaries ? boostPFSConfig.label.from_price_html.replace(/{{ price }}/, priceAmount) : priceAmount;
    var unitPriceClass = !data.available || typeof data?.selected_or_first_available_variant?.unit_price_measurement === 'undefined' ? 'hidden' : ''
    html = `<div class="price ${soldOut ? 'price--sold-out' : ''} ${onSale ? 'price--on-sale' : ''}${noComparePrice ? 'price--no-compare' : ''}">
          <div class="price__container">
            <div class="price__regular">
              <span class="visually-hidden visually-hidden--inline">
                ${boostPFSConfig.label.regular_price}
              </span>
              <span class="price-item price-item--regular">
                ${moneyPrice}
              </span>
            </div>
            <div class="price__sale">
              <span class="visually-hidden visually-hidden--inline">
                ${boostPFSConfig.label.regular_price}
              </span>
              <span>
                <s class="price-item price-item--regular">
                  ${compareAtPrice}
                </s>
              </span>
              <span class="visually-hidden visually-hidden--inline">${boostPFSConfig.label.sale_price}</span>
              <span class="price-item price-item--sale price-item--last">
                ${moneyPrice}
              </span>
            </div>
            <small class="unit-price caption ${unitPriceClass}">
              <span class="visually-hidden">${boostPFSConfig.label.unit_price}</span>
              <span class="price-item price-item--last">
                <span>${Utils.formatMoney(data.selected_or_first_available_variant && data.selected_or_first_available_variant.unit_price)}</span>
                <span aria-hidden="true">/</span>
                <span class="visually-hidden">&nbsp;${boostPFSConfig.label.unit_price_separator}&nbsp;</span>
              </span>
            </small>
          </div>
        </div>`
    return html;
  }

  function buildSoldOutLabel() {
    // Build Sold out label
    var soldOutLabel = '';
    if (boostPFSThemeConfig.custom.hasOwnProperty('sold_out_badge_color_scheme') && soldOut) {
      soldOutLabel = boostPFSTemplate.soldOutLabelHtml.replace(/{{soldOutBadgeClass}}/g, boostPFSThemeConfig.custom.sold_out_badge_color_scheme);
    }
    return soldOutLabel;
  }

  function buildSaleLabel() {
    // Build Sale label
    var saleLabel = '';
    if (boostPFSThemeConfig.custom.hasOwnProperty('sale_badge_color_scheme') && onSale && !soldOut) {
      saleLabel = boostPFSTemplate.saleLabelHtml.replace(/{{saleBadgeClass}}/g, boostPFSThemeConfig.custom.sale_badge_color_scheme);
    }
    return saleLabel;
  }

  function buildReview(data) {
    var html = '';
    if (boostPFSThemeConfig.custom.hasOwnProperty('show_product_review') &&
      boostPFSThemeConfig.custom.show_product_review == true && Utils.getProductMetafield(data, 'reviews', 'rating') !== null) {
      var ratingObj = JSON.parse(Utils.getProductMetafield(data, 'reviews', 'rating'));
      var rating_decimal = 0;
      var decimal = parseFloat(ratingObj.value.rating);
      if (decimal >=0.3 && decimal <= 0.7) {
        rating_decimal = 0.5;
      } else if (decimal > 0.7) {
        rating_decimal = 1;
      }
      html = `<div class="rating" role="img" aria-label="${boostPFSConfig.label.star_reviews_info.replace('{{ rating_value }}', ratingObj.value).replace('{{ rating_max }}', ratingObj.value.scale_max)}">
                <span aria-hidden="true" class="rating-star color-icon-${boostPFSConfig.custom.accent_icons}" style="--rating: ${Math.round(ratingObj.value.rating)}; --rating-max: ${ratingObj.value.scale_max}; --rating-decimal: ${rating_decimal};"></span>
              </div>
              <p class="rating-text caption">
                <span aria-hidden="true">${ratingObj.value} / ${ratingObj.value.scale_max}</span>
              </p>
              <p class="rating-count caption">
                <span aria-hidden="true">(${Utils.getProductMetafield(data, 'reviews', 'rating_count')})</span>
                <span class="visually-hidden">${Utils.getProductMetafield(data, 'reviews', 'rating_count')} ${boostPFSConfig.label.total_reviews}</span>
              </p>`;
    }
    return html;
  }
    
  function getAspectRatio(data) {
    var width = (data == null) ? '535' : data.width;
    var height = (data == null) ? '535' : data.height;

    return width / height;
  }

  function getRatioImage(data) {
    var ratio = 1;
    if (images && boostPFSThemeConfig.custom.media_size == 'portrait') {
      ratio = 0.8;
    } else if (images && boostPFSThemeConfig.custom.media_size == 'adapt') {
      ratio = getAspectRatio(data.images[0]);
    }
    if (ratio === 0 || ratio === null) {
      ratio = 1;
    }
    return ratio;
  }

  /************************** END BUILD PRODUCT ITEM ELEMENTS **************************/
  /************************** BUILD TOOLBAR **************************/
  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {
    if (!totalProduct) totalProduct = this.totalProduct;
    // Get page info
    var currentPage = parseInt(Globals.queryParams.page);
    var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);
    // If it has only one page, clear Pagination
    if (totalPage <= 1) {
      return '';
    }

    var paginationHtml = boostPFSTemplate.paginateHtml;
    // Build Previous
    var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : '';
    previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
    paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);
    // Build Next
    var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : '';
    nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
    paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);
    // Create page items array
    var beforeCurrentPageArr = [];
    for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
      beforeCurrentPageArr.unshift(iBefore);
    }
    if (currentPage - 4 > 0) {
      beforeCurrentPageArr.unshift('...');
    }
    if (currentPage - 4 >= 0) {
      beforeCurrentPageArr.unshift(1);
    }
    beforeCurrentPageArr.push(currentPage);
    var afterCurrentPageArr = [];
    for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
      afterCurrentPageArr.push(iAfter);
    }
    if (currentPage + 3 < totalPage) {
      afterCurrentPageArr.push('...');
    }
    if (currentPage + 3 <= totalPage) {
      afterCurrentPageArr.push(totalPage);
    }
    // Build page items
    var pageItemsHtml = '';
    var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
    for (var iPage = 0; iPage < pageArr.length; iPage++) {
      if (pageArr[iPage] == '...') {
        pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
      } else {
        pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
      }
      pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
      pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
    }
    paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
    return paginationHtml;
  };

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function () {
    var html = '';
    if (boostPFSTemplate.hasOwnProperty('sortingHtml')) {
      var sortingArr = Utils.getSortingList();
      if (sortingArr) {
        var paramSort = Globals.queryParams.sort || '';
        // Build content
        var sortingItemsHtml = '';
        for (var k in sortingArr) {
          var isSelected = ''
          if(paramSort == k) {
            isSelected = 'selected="selected"'
          }
          sortingItemsHtml += '<option value="' + k + '"' + isSelected + '>' + sortingArr[k] + '</option>';
        }
        html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      }
    }
    return html;
  };

  ProductSorting.prototype.render = function () {
    jQ(Selector.topSorting).html(this.compileTemplate());

    if (jQ('.boost-pfs-filter-custom-sorting').hasClass('boost-pfs-filter-sort-active')) {
      jQ('.boost-pfs-filter-custom-sorting').toggleClass('boost-pfs-filter-sort-active');
    }

    var labelSort = '';
    var paramSort = Globals.queryParams.sort || '';
    var sortingList = Utils.getSortingList();
    if (paramSort.length > 0 && sortingList && sortingList[paramSort]) {
      labelSort = sortingList[paramSort];
    } else {
      labelSort = Labels.sorting;
    }

    jQ('.boost-pfs-filter-custom-sorting button span span').text(labelSort);
  }

  // Build Sorting event
  ProductSorting.prototype.bindEvents = function() {
    jQ(Selector.topSorting + ' .facet-filters__sort').change(function(e) {
      e.preventDefault();
      FilterApi.setParam('sort', jQ(this).val());
      FilterApi.setParam('page', 1);
      FilterApi.applyFilter('sort');
    });
  };

  // Add additional feature for product list, used commonly in customizing product list
  ProductList.prototype.afterRender = function(data) {
    if (!data) data = this.data;
  }

  // Build Additional Elements
  Filter.prototype.afterRender = function(data, eventType) {
    if (!data) data = this.data;
    jQ('.boost-pfs-filter-total-product').html(data.total_product + ' products');
  };

  /************************** END BUILD TOOLBAR **************************/
})();
