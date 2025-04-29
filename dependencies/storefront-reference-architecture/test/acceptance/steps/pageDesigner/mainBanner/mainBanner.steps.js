'use strict';

const { I, data, pageDesigner, utilities } = inject();

Then('shopper should see the main banner', () => {
    I.waitForElement(pageDesigner.locators.mainBanner);
    I.seeElement(pageDesigner.locators.mainBanner);
});

Then('shopper should see the main banner message', () => {
    let mainBannerElement = locate(pageDesigner.locators.mainBanner).at(1);
    I.scrollTo(mainBannerElement);

    pageDesigner.carouselControlClick(1, pageDesigner.locators.carouselNext);
    let secondBannerElement = locate(pageDesigner.locators.mainBanner).at(2);
    let heading = secondBannerElement.find(
        pageDesigner.locators.mainBannerHeading
    );
    let subHeading = secondBannerElement.find(
        pageDesigner.locators.mainBannerSubHeading
    );

    I.see(data.pageDesigner.mainBannerHeading2, heading);
    I.see(data.pageDesigner.mainBannerSubHeading, subHeading);
    pageDesigner.carouselControlClick(
        1,
        pageDesigner.locators.carouselPrevious
    );
});

Then(
    'shopper should go to womens clothing dresses clicking on the main banner',
    () => {
        let mainBannerElement = locate(pageDesigner.locators.mainBanner).at(1);
        let subHeading = mainBannerElement.find(
            pageDesigner.locators.mainBannerSubHeading
        );

        utilities.clickToLoadPage(subHeading, data.pageDesigner.mainBannerLink);
    }
);
