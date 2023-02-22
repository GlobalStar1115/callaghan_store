// Override Settings
var boostPFSInstantSearchConfig = {
  search: {
    //suggestionMode: 'test',
    //suggestionPosition: 'left'
  }
};

(function() {
  BoostPFS.inject(this);

  // Customize style of Suggestion box
  SearchInput.prototype.customizeInstantSearch = function() {};

  SearchInput.prototype.afterBindEvents = function() {
    // Fix cannot close search suggestion when clicking overlay 
    document.addEventListener('click', function(e) {
      if(this.searchAutoComplete && this.searchAutoComplete.isOpen && e && e.target) {
        var $clickedElement = jQ(e.target);
        var isClickSuggestion = $clickedElement.closest('.' + Class.searchSuggestionWrapper).length > 0;
        if (isClickSuggestion) {
          this.searchAutoComplete.$element.hide();
          this.searchAutoComplete.searchInput.onCloseAutocomplete();
          this.searchAutoComplete.isOpen = false;
        }
      }
    }.bind(this), true);
  }
})();