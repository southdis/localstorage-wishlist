(function ($) {
	$(document).ready(function () {
        /**
         * Обновление счетчика
         */
        const wishlistUpdateHTMLCounter = (selector = '.shop-wishlist-count') => {
            const wishlistCountBlock = $(selector);

            if (!wishlistCountBlock) return;

            const wishlist = localStorage.getItem('shop_wishlist');                        
            const wishlistCount = (wishlist !== null) ? JSON.parse(wishlist).products_ids.length : 0;

            wishlistCountBlock.html(wishlistCount);
        }        

        const wishlistUpdateHTMLButtons = (selector = '.product-preview__wishlist') => {
            const wishlistButtons = $(selector);
            const shopWishlist = JSON.parse(localStorage.getItem('shop_wishlist'));

            wishlistButtons.each(function( index ) {                
                const wishlistBtn = $(this);
                const productID = Number(wishlistBtn.data('product'));               

                wishlistBtn.addClass('product-preview__wishlist--load');

                if (shopWishlist == null || !shopWishlist.products_ids.length) {
                    wishlistBtn.removeClass('product-preview__wishlist--load product-preview__wishlist--added');
                    return;
                }
    
                if (shopWishlist.products_ids.includes(productID)) {
                    wishlistBtn.addClass('product-preview__wishlist--added');
                } else {                
                    wishlistBtn.removeClass('product-preview__wishlist--added');
                }

                wishlistBtn.removeClass('product-preview__wishlist--load');
            });
        }        

        /**
         * Добавление\удаление товаров
         */
		$(document)
			.on('click', '.product-preview__wishlist', function(e){
				e.preventDefault();

                const wishlistBtn = $(this);
                const productID = Number(wishlistBtn.data('product'));
                
                if (!productID || wishlistBtn.hasClass('product-preview__wishlist--load')) return;                          

                // Данные вишлиста 
                const wishlistJSON = JSON.parse(localStorage.getItem('shop_wishlist'));                               
                const wishlistProducts = {products_ids : []};                
                let wishlistProductsIds = [];                

                wishlistBtn.addClass('product-preview__wishlist--load');

                if (wishlistJSON == null || !wishlistJSON.products_ids.length) {
                    // Вишлист пуст, добавляем товар
                    localStorage.setItem('shop_wishlist', JSON.stringify({ products_ids : [productID] }));                    
                    wishlistBtn.addClass('product-preview__wishlist--added');
                } else {
                    // Вишлист содержит товары                    
                    wishlistProductsIds = wishlistJSON.products_ids;

                    // Удаляем товар, если он уже есть в вишлисте
                    if (wishlistProductsIds.includes(productID)) {                        
                        const productIdIndex = wishlistProductsIds.indexOf(productID);

                        if (productIdIndex !== -1){
                            wishlistProducts.products_ids = wishlistProductsIds.toSpliced(productIdIndex, 1);                            
                            localStorage.setItem(
                                'shop_wishlist',
                                JSON.stringify(wishlistProducts)
                            );
                        }   

                        wishlistBtn.removeClass('product-preview__wishlist--added');
                    } else {
                        // Добавляем товар в вишлист
                        wishlistProductsIds.push(productID);
                        wishlistProducts.products_ids = wishlistProductsIds;                         
                        localStorage.setItem('shop_wishlist', JSON.stringify(wishlistProducts))

                        wishlistBtn.addClass('product-preview__wishlist--added');
                    }  
                }                              

                console.log( 'shop_wishlist', JSON.parse(localStorage.getItem('shop_wishlist')) );
                
                wishlistBtn.removeClass('product-preview__wishlist--load');	

                wishlistUpdateHTMLCounter();
                wishlistUpdateHTMLButtons();
			});
        
        /**
         * Вывод товаров на странице вишлиста
         */        
        const wishlistPageOutput = () => {
            const wishlistPageContainer = $('.shop-wishlist');

            if (!wishlistPageContainer) return;

            const shopWishlist = JSON.parse(localStorage.getItem('shop_wishlist'));

            wishlistPageContainer
                .addClass('shop-wishlist--loading')
                .html(`Загрузка...`);           

            if (shopWishlist == null) {
                wishlistPageContainer.html(`Список избранных товаров пуст`);
                return;
            }

            const shopWishlistPageData = {
				action : "get_shop_wishlist_html",
                products_ids : JSON.stringify(shopWishlist.products_ids)
			};

			$.post(
                motordevJsExtra['ajaxUrl'],
                shopWishlistPageData,
                function (getShopWishlistHtmlResponse) {
                    if( getShopWishlistHtmlResponse.success ) {
                        wishlistPageContainer
                            .html(getShopWishlistHtmlResponse.data)
                            .removeClass('shop-wishlist--loading');	
                    }
                }
            );

            wishlistUpdateHTMLButtons();
        }

        wishlistUpdateHTMLCounter();
        wishlistUpdateHTMLButtons();
        wishlistPageOutput();
	});
})(jQuery);