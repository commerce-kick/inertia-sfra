'use strict';

module.exports = {
    addProduct: function () {
        $('.add-product').on('click', function (e) {
            e.preventDefault();
            var element = $(this);
            var url = element.attr('href');

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.redirectUrl) {
                        window.location.href = data.redirectUrl;
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                }
            });
        });
    }
};
