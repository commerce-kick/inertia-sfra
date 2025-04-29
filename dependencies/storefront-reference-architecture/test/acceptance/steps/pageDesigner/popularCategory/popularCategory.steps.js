'use strict';

const { I, pageDesigner } = inject();

Then('shopper should see the popularCategories layout', () => {
    I.waitForElement('.popular-categories');
    I.seeElement('.popular-categories .popular-cat-heading');
    I.see('Popular Catalogs', '.popular-cat-heading h3');
    I.seeElement('.popular-categories .popular-category');
});

Then('shopper should see the popularCategory components', () => {
    I.seeNumberOfElements('.popular-category', 6);
    I.see('Outfits', locate('.popular-cat-link').at(1));
    I.see('Tops', locate('.popular-cat-link').at(2));
    I.see('Dresses', locate('.popular-cat-link').at(3));
    I.see('Bottoms', locate('.popular-cat-link').at(4));
    I.see('Jackets & Coats', locate('.popular-cat-link').at(5));
    I.see('Feeling Red', locate('.popular-cat-link').at(6));
});

Then('shopper can click on a popular category', () => {
    pageDesigner.clickPopulareCategory(1, '.popular-category', '/s/RefArch/new arrivals/womens/?lang=default');
});
