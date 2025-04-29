module.exports = function ({ env, sites, catalogs, libraries, inventoryLists}) {
    return `<html>
<head>
    <title>Data Export</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>

    <style>
        h2 {
            font-size: 1.5em;
            margin: .5em 0 1em 0;
        }
    </style>
</head>
<body>

<div class="container">
    <form action="/" method="post">
        <h1>Data Export</h1>
        <h2>${env.server}}</h2>

        <p>
            Jump to Site:
            ${sites.map((site) => `<a href="#sites|${site}|all">${site}</a>`).join(' | ')}
        </p>
        <p>Select the items to export</p>

        <div style="margin-left: 40px; margin-bottom: 20px;">
            <button class="btn btn-danger btn-lg" name="cancel">Cancel</button>
            <button class="btn btn-primary btn-lg" name="export">Export</button>
        </div>

        <ul>
            <li>
                <input type="checkbox" name="global_data|all" id="global_data|all">
                 <label for="global_data|all">Global Data</label>

                <ul class="submenu">
                    <li><input type="checkbox" name="global_data|system_type_definitions" id="global_data|system_type_definitions"/> <label for="global_data|system_type_definitions">System Type Definitions (Metadata).</label></li>
                    <li><input type="checkbox" name="global_data|custom_types" id="global_data|custom_types"/> <label for="global_data|custom_types">Custom Types Definitions (Metadata).</label></li>
                    <li><input type="checkbox" name="global_data|meta_data" id="global_data|meta_data"/> <label for="global_data|meta_data">System + Custom Types (Metadata)</label></li>
                    <li><input type="checkbox" name="global_data|access_roles" id="global_data|access_roles"/> <label for="global_data|access_roles">Access Roles</label></li>
                    <li><input type="checkbox" name="global_data|csc_settings" id="global_data|csc_settings"/> <label for="global_data|csc_settings">Settings for Customer Service Center customization.</label></li>
                    <li><input type="checkbox" name="global_data|csrf_whitelists" id="global_data|csrf_whitelists"/> <label for="global_data|csrf_whitelists">CSRF Allowlists.</label></li>
                    <li><input type="checkbox" name="global_data|custom_preference_groups" id="global_data|custom_preference_groups"/> <label for="global_data|custom_preference_groups">Global Preferences</label></li>
                    <li><input type="checkbox" name="global_data|custom_quota_settings" id="global_data|custom_quota_settings"/> <label for="global_data|custom_quota_settings">Custom quota settings of the instance.</label></li>
                    <li><input type="checkbox" name="global_data|geolocations" id="global_data|geolocations"/> <label for="global_data|geolocations">Geolocations of the organization.</label></li>
                    <li><input type="checkbox" name="global_data|global_custom_objects" id="global_data|global_custom_objects"/> <label for="global_data|global_custom_objects">Global custom objects.</label></li>
                    <li><input type="checkbox" name="global_data|job_schedules" id="global_data|job_schedules"/> <label for="global_data|job_schedules">Scheduled job definitions.</label></li>
                    <li><input type="checkbox" name="global_data|job_schedules_deprecated" id="global_data|job_schedules_deprecated"/> <label for="global_data|job_schedules_deprecated">Deprecated scheduled job definitions.</label></li>
                    <li><input type="checkbox" name="global_data|locales" id="global_data|locales"/> <label for="global_data|locales">Locales.</label></li>
                    <li><input type="checkbox" name="global_data|oauth_providers" id="global_data|oauth_providers"/> <label for="global_data|oauth_providers">OAuth providers.</label></li>
                    <li><input type="checkbox" name="global_data|ocapi_settings" id="global_data|ocapi_settings"/> <label for="global_data|ocapi_settings">Global OCAPI settings.</label></li>
                    <li><input type="checkbox" name="global_data|page_meta_tags" id="global_data|page_meta_tags"/> <label for="global_data|page_meta_tags">Page meta tag definitions.</label></li>
                    <li><input type="checkbox" name="global_data|preferences" id="global_data|preferences"/> <label for="global_data|preferences">Global preferences.</label></li>
                    <li><input type="checkbox" name="global_data|price_adjustment_limits" id="global_data|price_adjustment_limits"/> <label for="global_data|price_adjustment_limits">Price adjustment limits for all roles.</label></li>
                    <li><input type="checkbox" name="global_data|services" id="global_data|services"/> <label for="global_data|services">Service definitions from the service framework.</label></li>
                    <li><input type="checkbox" name="global_data|sorting_rules" id="global_data|sorting_rules"/> <label for="global_data|sorting_rules">Global sorting rules.</label></li>
                    <li><input type="checkbox" name="global_data|static_resources" id="global_data|static_resources"/> <label for="global_data|static_resources">Global static resources.</label></li>
                    <li><input type="checkbox" name="global_data|users" id="global_data|users"/> <label for="global_data|users">Users of the organization.</label></li>
                    <li><input type="checkbox" name="global_data|webdav_client_permissions" id="global_data|webdav_client_permissions"/> <label for="global_data|webdav_client_permissions">Global WebDAV Client Permissions.</label></li>
                </ul>
            </li>
            <li><input type="checkbox" name="catalog_static_resources|all" id="catalog_static_resources|all"/> <label for="catalog_static_resources|all">Catalog Static Resources</label>
                <ul class="submenu">
                    ${catalogs.map((catalog) => `
                        <li>
                            <input type="checkbox" name="catalog_static_resources|${catalog}" id="catalog_static_resources|${catalog}"/> <label for="catalog_static_resources|${catalog}">${catalog}</label>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
            <li><input type="checkbox" name="catalogs|all" id="catalogs|all"/> <label for="catalogs|all">Catalogs</label>
                <ul class="submenu">
                    ${catalogs.map((catalog) => `
                        <li>
                            <input type="checkbox" name="catalogs|${catalog}" id="catalogs|${catalog}"/> <label for="catalogs|${catalog}">${catalog}</label>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
            <li><input type="checkbox" name="libraries|all" id="libraries|all"/> <label for="libraries|all">Libraries</label>
                <ul class="submenu">
                    ${libraries.map((library) => `
                        <li>
                            <input type="checkbox" name="libraries|${library}" id="libraries|${library}"/> <label for="libraries|${library}">${library}</label>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
            <li><input type="checkbox" name="library_static_resources|all" id="library_static_resources|all"/> <label for="library_static_resources|all">Library Static Resources</label>
                <ul class="submenu">
                    ${libraries.map((library) => `
                        <li>
                            <input type="checkbox" name="library_static_resources|${library}" id="library_static_resources|${library}"/> <label for="library_static_resources|${library}">${library}</label>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
            <li><input type="checkbox" name="inventory_lists|all" id="inventory_lists|all"/> <label for="inventory_lists|all">Inventory Lists</label>
                <ul class="submenu">
                    ${inventoryLists.map((list) => `
                        <li>
                            <input type="checkbox" name="inventory_lists|${list}" id="inventory_lists|${list}"/> <label for="inventory_lists|${list}">${list}</label>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
            <li><input type="checkbox" name="customer_lists|all" id="customer_lists|all"/> <label for="customer_lists|all">Customer Lists</label></li>
            <li><input type="checkbox" name="price_books|all" id="price_books|all"/> <label for="price_books|all">Price Books</label></li>

            <li><input type="checkbox" name="sites|all" id="sites|all"/> <label for="sites|all">Sites</label>
                <ul class="submenu">
                    ${sites.map((site) => `
                        <li>
                            <input type="checkbox" name="sites|${site}|all" id="sites|${site}|all"/> <label for="sites|${site}|all">${site}</label>
                            <ul class="submenu">
                                <li><input type="checkbox" name="sites|${site}|ab_tests" id="sites|${site}|ab_tests"/><label for="sites|${site}|ab_tests">A/B Tests</label></li>
                                <li><input type="checkbox" name="sites|${site}|active_data_feeds" id="sites|${site}|active_data_feeds"/><label for="sites|${site}|active_data_feeds">Active Data Feeds.</label></li>
                                <li><input type="checkbox" name="sites|${site}|cache_settings" id="sites|${site}|cache_settings"/><label for="sites|${site}|cache_settings">Cache Settings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|campaigns_and_promotions" id="sites|${site}|campaigns_and_promotions"/><label for="sites|${site}|campaigns_and_promotions">Campaigns and Promotions.</label></li>
                                <li><input type="checkbox" name="sites|${site}|content" id="sites|${site}|content"/><label for="sites|${site}|content">Content.</label></li>
                                <li><input type="checkbox" name="sites|${site}|coupons" id="sites|${site}|coupons"/><label for="sites|${site}|coupons">Coupons.</label></li>
                                <li><input type="checkbox" name="sites|${site}|custom_objects" id="sites|${site}|custom_objects"/><label for="sites|${site}|custom_objects">Custom Objects.</label></li>
                                <li><input type="checkbox" name="sites|${site}|customer_cdn_settings" id="sites|${site}|customer_cdn_settings"/><label for="sites|${site}|customer_cdn_settings">Customer CDN Settings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|customer_groups" id="sites|${site}|customer_groups"/><label for="sites|${site}|customer_groups">Customer Groups.</label></li>
                                <li><input type="checkbox" name="sites|${site}|distributed_commerce_extensions" id="sites|${site}|distributed_commerce_extensions"/><label for="sites|${site}|distributed_commerce_extensions">Distributed Commerce Extensions.</label></li>
                                <li><input type="checkbox" name="sites|${site}|dynamic_file_resources" id="sites|${site}|dynamic_file_resources"/><label for="sites|${site}|dynamic_file_resources">Dynamic File Resources.</label></li>
                                <li><input type="checkbox" name="sites|${site}|gift_certificates" id="sites|${site}|gift_certificates"/><label for="sites|${site}|gift_certificates">Gift Certificates.</label></li>
                                <li><input type="checkbox" name="sites|${site}|ocapi_settings" id="sites|${site}|ocapi_settings"/><label for="sites|${site}|ocapi_settings">OCAPI Settings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|payment_methods" id="sites|${site}|payment_methods"/><label for="sites|${site}|payment_methods">Payment Methods.</label></li>
                                <li><input type="checkbox" name="sites|${site}|payment_processors" id="sites|${site}|payment_processors"/><label for="sites|${site}|payment_processors">Payment Processors.</label></li>
                                <li><input type="checkbox" name="sites|${site}|redirect_urls" id="sites|${site}|redirect_urls"/><label for="sites|${site}|redirect_urls">Redirect URLs.</label></li>
                                <li><input type="checkbox" name="sites|${site}|search_settings" id="sites|${site}|search_settings"/><label for="sites|${site}|search_settings">Search Settings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|shipping" id="sites|${site}|shipping"/><label for="sites|${site}|shipping">Shipping.</label></li>
                                <li><input type="checkbox" name="sites|${site}|site_descriptor" id="sites|${site}|site_descriptor"/><label for="sites|${site}|site_descriptor">Site Descriptor.</label></li>
                                <li><input type="checkbox" name="sites|${site}|site_preferences" id="sites|${site}|site_preferences"/><label for="sites|${site}|site_preferences">Site Preferences.</label></li>
                                <li><input type="checkbox" name="sites|${site}|sitemap_settings" id="sites|${site}|sitemap_settings"/><label for="sites|${site}|sitemap_settings">Sitemap Settings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|slots" id="sites|${site}|slots"/><label for="sites|${site}|slots">Slots.</label></li>
                                <li><input type="checkbox" name="sites|${site}|sorting_rules" id="sites|${site}|sorting_rules"/><label for="sites|${site}|sorting_rules">Sorting Rules.</label></li>
                                <li><input type="checkbox" name="sites|${site}|source_codes" id="sites|${site}|source_codes"/><label for="sites|${site}|source_codes">Source Codes.</label></li>
                                <li><input type="checkbox" name="sites|${site}|static_dynamic_alias_mappings" id="sites|${site}|static_dynamic_alias_mappings"/><label for="sites|${site}|static_dynamic_alias_mappings">Static, Dynamic and Alias mappings.</label></li>
                                <li><input type="checkbox" name="sites|${site}|stores" id="sites|${site}|stores"/><label for="sites|${site}|stores">Stores.</label></li>
                                <li><input type="checkbox" name="sites|${site}|tax" id="sites|${site}|tax"/><label for="sites|${site}|tax">Tax.</label></li>
                                <li><input type="checkbox" name="sites|${site}|url_rules" id="sites|${site}|url_rules"/><label for="sites|${site}|url_rules">URL Rules.</label></li>
                            </ul>
                        </li>
                    `).join('\n')}
                </ul>
            </li>
        </ul>

        <div style="margin-left: 40px; margin-top: 20px;">
            <button class="btn btn-danger btn-lg" name="cancel">Cancel</button>
            <button class="btn btn-primary btn-lg" name="export">Export</button>
        </div>

    </form>

</div>

<script>
    $('input[type="checkbox"]').click(function() {
        if( $(this).is(':checked') ) {
            $(this).siblings('.submenu').find('input[type="checkbox"]').prop('disabled', true).prop('checked', true);
        } else {
            $(this).siblings('.submenu').find('input[type="checkbox"]').prop('disabled', false).prop('checked', false);
        }
    });
</script>

</body>
</html>
`
}