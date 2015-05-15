angular.module('spanel.analytics', ['charts', 'spanel.purchases.services'])
    .config(function($routeProvider, templates) {

        $routeProvider.when('/analytics', {
            resolve: {
                redirect: function($location){
                    $location.path('/analytics/sharing');
                },
                changePosition: function(navigationService){
                    return navigationService.module('analytics').page("sharing");
                }

            }
        });

        $routeProvider.when('/analytics/sharing', {
            templateUrl: templates.analytics.sharing,
            controller: 'SharingAnalytics',
            resolve:  {
                changePosition: function(navigationService){
                    return navigationService.module('analytics').page("sharing");
                }
            }

        });

        $routeProvider.when('/analytics/return', {
            templateUrl: templates.analytics.return,
            controller: 'ReturnAnalytics',
            resolve:  {
                changePosition: function(navigationService){
                    return navigationService.module('analytics').page("return");
                }
            }

        });

        $routeProvider.when('/analytics/departments', {
            templateUrl: templates.analytics.departments,
            controller: 'DepartmentsAnalytics',
            resolve:  {
                changePosition: function(navigationService){
                    return navigationService.module('analytics').page("departments");
                }
            }

        });

        $routeProvider.when('/analytics/spread', {
            templateUrl: templates.analytics.spread,
            controller: 'SpreadAnalytics',
            resolve:  {
                changePosition: function(navigationService){
                    return navigationService.module('analytics').page("spread");
                }
            }

        });
    })

    .controller('SpreadAnalytics', function($scope, $rootScope,  auth, dates, $http, config, errors, $compile){

        var currentDate = dates.dateToYYMMDD(new Date());

        $scope.partner = auth.partner;

        $scope.filter = {
            min_date: auth.partner.create_date,
            max_date: currentDate,
            start_date: auth.partner.create_date,
            end_date: currentDate,
            limit: 5
        };

        $scope.download_spread_url = function(){
            return config.urls.spanel.analytics.products_spread + 'csv/?start_date='+ $scope.filter.start_date + '&end_date=' + $scope.filter.end_date + '&limit=' + ( $scope.filter.limit || 0);
        };

        $scope.loadData = function() {
            if($scope.filter.limit != '' && !isNaN($scope.filter.limit)){
                $rootScope.global.loader = true;
                $http.get(config.urls.spanel.analytics.products_spread+'?start_date=' + $scope.filter.start_date +'&end_date=' + $scope.filter.end_date + '&limit=' + ( $scope.filter.limit || 0) )
                    .success(function(res){
                        $rootScope.global.loader = false;
                        if(res.status == 'error'){
                            $scope.$emit('notify', res.message);
                        }
                        else {
                            delete res.status;
                            res['3'] = res['0'];
                            delete res['0'];
                            for(var sex in res){
                                for(var age in res[sex]){

                                    if(!res[sex][age].length) delete res[sex][age];

                                }
                                if(!Object.keys(res[sex]).length){
                                    delete res[sex];
                                }
                            }

                            $scope.spreadTable = res;

//                            console.dir($scope.spreadTable);
    //                        console.dir($scope.dep_convertion);
                        }
                    })
                    .error(function(data, status){
                        errors.handle(status);
                    });
            }

        };

        $scope.getSex = function(id){
            if(id == 3) return 'Не указан';
            if(id == 1) return 'Мужчины';
            if(id == 2) return 'Женщины';
            else return '';
        };

        $scope.getAge = function(age){
            if(age == 0) return 'Не указан';
            if(age.indexOf('I_') == 0) return age.substring(2) + ' лет';
            if(age.indexOf('G_') == 0) return 'Старше ' + age.substring(2) + ' лет';
            if(age.indexOf('L_') == 0) return 'Младше ' + age.substring(2) + ' лет';
            return '';
        };

        $scope.getSexSpan = function(sexGroup){
            var allproducts = 1;
            for(var age in sexGroup){
                var segm = sexGroup[age];
                for(var pr in segm){
                    allproducts+=1;
                }
                allproducts+=1
            }
            return allproducts;
        };

        $scope.loadData();

        $scope.$on('changeDate', function(){

            $scope.loadData();

        });

        $rootScope.global.loader = false;

    })

    .controller('DepartmentsAnalytics', function($scope, auth, $rootScope, dates, config, $http, purchasesService, sugar, errors){

        $scope.partner = auth.partner;

        $scope.departments = auth.departments;

        $scope.download_convertion_url = function(){
            return config.urls.spanel.analytics.conversion_by_departments + 'csv/?start_date='+ $scope.filter.start_date + '&end_date=' + $scope.filter.end_date;
        };

         $scope.download_dep_url = function(){
            return config.urls.spanel.analytics.report_by_departments + 'csv/?start_date='+ $scope.filter.start_date + '&end_date=' + $scope.filter.end_date;
        };

        var currentDate = dates.dateToYYMMDD(new Date());

        $scope.filter = {
            min_date: auth.partner.create_date,
            max_date: currentDate,
            start_date: auth.partner.create_date,
            end_date: currentDate
        };

        function loadData(){
            $rootScope.global.loader = true;
            $http.get(config.urls.spanel.analytics.conversion_by_departments+'?start_date=' + $scope.filter.start_date +'&end_date=' + $scope.filter.end_date)
                .success(function(res){
                    if(res.status == 'error'){
                        $scope.$emit('notify', 'Ошибка загрузки данных');
                    }
                    else {
                        $scope.dep_convertion = sugar.objToArray(res.data);
//                        console.dir($scope.dep_convertion);
                    }
                })
                .error(function(data, status){
                    errors.handle(status);
                });
            $http.get(config.urls.spanel.analytics.report_by_departments+'?start_date=' + $scope.filter.start_date +'&end_date=' + $scope.filter.end_date)
                .success(function(res){
                    $rootScope.global.loader = false;
                    if(res.status == 'error'){
                        $scope.$emit('notify', 'Ошибка загрузки данных');
                    }
                    else {
                        $scope.depStatistic = sugar.objToArray(res.data);
                        $scope.loadManagersStatistic = function(rowDepStatistic) {
                            var isExpanded = rowDepStatistic.isExpanded;
                            for(var stat in $scope.depStatistic){
                                $scope.depStatistic[stat].isExpanded = false;
                            }
                            rowDepStatistic.isExpanded = isExpanded ? false : true;
                            if (!isUndefined(rowDepStatistic.managersStatistic)) {
                                return;
                            }
                            $rootScope.global.loader = true;
                            $http.get(config.urls.spanel.analytics.report_department_managers+'?start_date=' + $scope.filter.start_date +'&end_date=' + $scope.filter.end_date + '&dep_id=' + parseInt(rowDepStatistic.key))
                                .success(function(res){
//                                    console.dir(res);
                                    var data = res['data'];
                                    rowDepStatistic.managersStatistic = sugar.numbersToInt(data);
                                    $rootScope.global.loader = false;
                                });

                        };
                    }
                })
                .error(function(data, status){
                    errors.handle(status);
                });
        }

        loadData();

        $scope.$on('changeDate', function(){

            loadData();

        });

        $rootScope.global.loader = false;

    })

    .controller('ReturnAnalytics', function($scope, $rootScope, auth, chartsData, config, dates){



        var currentDate = dates.dateToYYMMDD(new Date());


        $scope.filter = {
            min_date: auth.partner.create_date,
            max_date: currentDate,
            start_date: auth.partner.create_date,
            end_date: currentDate
        };

        function loadReturnData(){
            //load purchases count charts
            chartsData.loadData(config.urls.spanel.analytics.return_data+'?start_date=' + $scope.filter.start_date +'&end_date=' + $scope.filter.end_date +'&max_columns=6')
            .success(function(res){

                for(var ge in res.clients_purchases_count_gte){

                    $scope.moreEqualsChart.bars[ge].value = res.clients_purchases_count_gte[ge]

                }
                for(var eq in res.clients_purchases_count_equal){

                    $scope.equalsChart.bars[eq].value = res.clients_purchases_count_equal[eq]

                }
                $rootScope.global.loader = false;

            });
            //load repeated purchases chart
            chartsData.loadData(config.urls.spanel.analytics.repeated_purchases_by_month + '?columns=7')
                .success(function(res){
                    $scope.returnedChart.bars = {};
                    for(var m = 0; m < res.result.length; m+=1){
                        var monthBar = res.result[m];
                        $scope.returnedChart.bars[m] = {

                            title: dates.months[monthBar.month] + ' ' + monthBar.year,
                            full_info: 'Доля повторных покупок в этом месяце составила: <span class="bar_value">'+ (monthBar.repeated_cnt/(monthBar.cnt/100)).toFixed(2) +'%</span>.<br/>Или <span class="bar_value">' + monthBar.repeated_cnt + '</span> покупок из <span class="bar_value">' + monthBar.cnt + '</span>',
                            stack: {

                                sum: { value: monthBar.cnt, fill: '#fb9400' },
                                segments: [ { value: monthBar.repeated_cnt, fill: '#3fb7f5'} ]

                            }

                        }

                    }

                })
        }

        //load start data
        loadReturnData();

        $scope.$on('changeDate', function(){

            loadReturnData();

        });

        $scope.moreEqualsChart = {
            title: 'Количество клиентов, совершивших \u2265N покупок за указанный период. </br><span> Наведите курсор мыши на столбец, чтобы посмотреть подробную информацию.</span>',
            bars: {
                0: {
                    title: 'Всего',
                    value: 0,
                    full_info: function(){ return 'Всего пользователей, <br/>зарегистрировавшихся в указанный период: <span class="bar_value">' + this.value + '</span>'; }
                },
                1: {
                    title: '\u22651',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22651 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }

                },
                2: {
                    title: '\u22652',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22652 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                3: {
                    title: '\u22653',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22653 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                4: {
                    title: '\u22654',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22654 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                5: {
                    title: '\u22655',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22655 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                6: {
                    title: '\u22656',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших \u22656 покупки: <span class="bar_value">' + this.value  + '</span> или <span class="bar_value">' + (this.value /($scope.moreEqualsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                }

            }

        };

        $scope.equalsChart = {
            title: 'Количество клиентов, совершивших N покупок. </br>Наведите курсор мыши на столбец, чтобы посмотреть подробную информацию.',
            bars: {
                0: {
                    title: 'Всего',
                    value: 0,
                    full_info: function(){ return 'Всего пользователей, <br/>зарегистрировавшихся в указанный период: <span class="bar_value">' + this.value + '</span>'; }
                },
                1: {
                    title: '=1',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 1 покупку: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }

                },
                2: {
                    title: '=2',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 2 покупки: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                3: {
                    title: '=3',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 3 покупки: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                4: {
                    title: '=4',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 4 покупки: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                5:{
                    title: '=5',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 5 покупок: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                },
                6:{
                    title: '\u22656',
                    value: 0,
                    full_info: function(){ return 'Пользователей, зарегистрировавшихся в указанный период <br/>и совершивших 6 и более покупок: <span class="bar_value">' + this.value + '</span> или <span class="bar_value">' + (this.value/($scope.equalsChart.bars['0'].value/100)).toFixed(2) + '%' + '</span>'; }
                }

            }

        };

        $scope.returnedChart = {

            title: 'Доля повторных покупок по месяцам. </br>Наведите курсор мыши на столбец, чтобы посмотреть подробную информацию.',
            bars: {

            }

        };


    })

    .controller('SharingAnalytics', function($scope, $rootScope, auth, config){
        $scope.partner = auth.partner;
        $scope.user = auth.user;
        $scope.$on('authSuccess', function(){

            $scope.partner = auth.partner;
            $scope.user = auth.user;
            start();

        });
        var AnalyticsApp = {
            init: function(options) {
                this.options = options;
                this.cacheElements();
                this.bindEvents();
                this.initDatePickers();
                this.query();
            },

            cacheElements: function() {
                this.$dateSelector = $('.date_selector .arrow');
                this.$socialTypesCheckboxes = $('.social_types input[type=checkbox]');
            },

            bindEvents: function() {
                this.$dateSelector.click(this.toggleDatePicker);
                this.$socialTypesCheckboxes.on('change', function() {
                   AnalyticsApp.query();
                });
            },

            onSelectDate: function(dateStr, el) {
                var self = AnalyticsApp,
                    pickerWrapper = el.dpDiv.parent();
                if (pickerWrapper.hasClass('start'))
                    self.startDate = dateStr;
                if (pickerWrapper.hasClass('end'))
                    self.endDate = dateStr;
                pickerWrapper.toggle();
                pickerWrapper.parents('.date_selector').find('span').text(self.humanDate(dateStr));
                if (Date.parse(self.startDate) > Date.parse(self.endDate)) {
                    alert('Неправильный интервал даты');
                    return;
                }
                self.query();
            },

            toggleDatePicker: function(e) {
                e.stopPropagation();
                var $thisEl = $(this).parent(),
                    $thisDatePicker = $thisEl.find('.date_filter_datepicker');
                if ($thisDatePicker.is(':visible')) {
                    $thisDatePicker.hide();
                    return;
                }
                $('.date_filter_datepicker').hide();
                $thisDatePicker.toggle();
            },

            now: function() {
                var d = new Date();
                var curr_date = d.getDate();
                var curr_month = d.getMonth() + 1; //Months are zero based
                var curr_year = d.getFullYear();
                return curr_year + '-' + zfill(curr_month, 2) + '-' + zfill(curr_date, 2);
            },

            humanDate: function(dateStr) {
                var parts = dateStr.split('-');
                return zfill(parts[2], 2) + '.' + zfill(parts[1], 2) + '.' + parts[0];
            },

            initDatePickers: function() {
                var self = AnalyticsApp;
                self.startDate = self.options.minDate;
                self.endDate = self.now();

                if (!self.options.enabledDateSelectors)
                    return;

                var datepickerStartDateOptions = {
                        minDate: self.options.minDate,
                        defaultDate: self.options.minDate,
                        dateFormat: "yy-mm-dd",
                        onSelect: self.onSelectDate
                    },
                    datepickerEndDateOptions = {
                        minDate: self.options.minDate,
                        defaultDate: self.options.minDate,
                        dateFormat: "yy-mm-dd",
                        onSelect: self.onSelectDate
                    };
                var $dateFilterStartDatepicker = $('.date_filter_datepicker.start'),
                    $dateFilterEndDatepicker = $('.date_filter_datepicker.end');

                $dateFilterStartDatepicker.parents('.date_selector').find('span').text(self.humanDate(self.startDate));
                $dateFilterEndDatepicker.parents('.date_selector').find('span').text(self.humanDate(self.endDate));

                $dateFilterStartDatepicker.datepicker(datepickerStartDateOptions);
                $dateFilterEndDatepicker.datepicker(datepickerEndDateOptions);
            },

            buildQueryParams: function() {
                var self = AnalyticsApp;
                var qparams = {
                    start_date: self.startDate, end_date: self.endDate,
                    social_types: []
                };

                self.$socialTypesCheckboxes.each(function(){
                    if ($(this).is(':checked'))
                        qparams.social_types.push($(this).attr('name'));
                });

                return qparams;
            },

            query: function() {
                $('.loader').show();
                $('.circles_area').fadeOut('fast');
                var self = AnalyticsApp,
                    qparams = self.buildQueryParams();
                if (!qparams.start_date || !qparams.end_date || qparams.social_types.length === 0)
                    return;
                $rootScope.global.loader = true;
                $.ajax({
                    type: "GET",
                    url: self.options.queryUrl,
                    data: {qparams: JSON.stringify(qparams)},
                    success: function(res) {
                        $rootScope.global.loader = false;
                        self.drawCircles(res['data']);
                    }
                });

            },

            circleSize: function(curr, next) {
                var size = 0.5 * AnalyticsApp.options.initCircleSize * (1 + next/curr);
                if (size < 100)
                    size = 100;
                if (size > 200)
                    size = 200;
                if (isNaN(size))
                    size = 100;
                return size;
            },

            drawCircles: function(data) {
                jsPlumb.reset();
                var commonPlumb = {
                    cssClass: 'analytic_graph',
                    endpoints:['Blank', 'Blank'],
                    paintStyle: {lineWidth: 1, strokeStyle: '#1a96ec'},
                    endpointStyle: {fillStyle: '#000000'},
                    overlays:[
        //                [ 'Label', {label: '<div style="left: 60%; position: relative;">35.6%</div>', id: 'label', location: 0.5}],
                        [ 'Arrow', { width: 7, length: 10, location: 1, id: 'arrow'}]
                    ]
                };

                var self = AnalyticsApp;
                var baseSize = self.options.initCircleSize,
                    regUsersPurchasesCountSize = self.circleSize(data['registered_users_count'], data['registered_users_purchases_count']),
                    sharingUsersCountSize = self.circleSize(data['registered_users_count'], data['sharing_users_count']),
                    sharingCountSize = self.circleSize(data['sharing_users_count'], data['sharing_count']),
                    redirectsCountSize = self.circleSize(data['sharing_count'], data['redirects_count']),
                    referredCountSize = self.circleSize(data['redirects_count'], data['referred_count']);

                $('.registered_users_count').css({width: baseSize + 'px', height: baseSize + 'px', fontSize: baseSize/6});

                if (self.options.enabledCircles.registeredUsersPurchasesCount)
                    $('.registered_users_purchases_count').css({width: regUsersPurchasesCountSize + 'px', height: regUsersPurchasesCountSize + 'px', fontSize: regUsersPurchasesCountSize/6});

                $('.sharing_users_count').css({width: sharingUsersCountSize + 'px', height: sharingUsersCountSize + 'px', fontSize: sharingUsersCountSize/6});
                $('.sharing_count').css({width: sharingCountSize + 'px', height: sharingCountSize + 'px', fontSize: sharingCountSize/6});
                $('.redirects_count').css({width: redirectsCountSize + 'px', height: redirectsCountSize + 'px', fontSize: redirectsCountSize/6});

                if (self.options.allCircles) {
                    $('.referred_count').css({width: referredCountSize + 'px', height: referredCountSize + 'px', fontSize: referredCountSize/6});
                    $('.referred_purchases_count').css({width: baseSize + 'px', height: baseSize + 'px', fontSize: baseSize/6});
                }

                var perimeterAnchors = [ ['Perimeter', {shape: 'Circle'}], ['Perimeter', {shape: 'Circle'}]],
                    leftMiddleAnchors = [ ['LeftMiddle', {shape: 'Circle'}], ['LeftMiddle', {shape: 'Circle'}] ];
                for (var k in data){
                    $('.' + k).find('span').text(data[k]);
                }
                $('.circles_area').fadeIn('fast', function() {
                    if (self.options.enabledCircles.registeredUsersPurchasesCount)
                        jsPlumb.connect({source: 'registered_users_count', target: 'registered_users_purchases_count', anchors: perimeterAnchors, connector: ['Bezier']}, commonPlumb);

                    jsPlumb.connect({source: 'registered_users_count', target: 'sharing_users_count', anchors: perimeterAnchors, connector: ['Bezier']}, commonPlumb);
                    jsPlumb.connect({source: 'sharing_users_count', target: 'sharing_count', anchors: perimeterAnchors, connector: ['Bezier']}, commonPlumb);
                    jsPlumb.connect({source: 'sharing_count', target: 'redirects_count', anchors: perimeterAnchors, connector: ['Bezier']}, commonPlumb);

                    if (self.options.allCircles) {
                        jsPlumb.connect({source: 'redirects_count', target: 'referred_count', anchors: perimeterAnchors, connector: ['Flowchart']}, commonPlumb);
                        jsPlumb.connect({source: 'redirects_count', target: 'referred_purchases_count', anchors: leftMiddleAnchors}, commonPlumb);
                        jsPlumb.connect({source: 'referred_count', target: 'referred_purchases_count', anchors: perimeterAnchors, connector: ['Flowchart']}, commonPlumb);
                    }

                    $('.loader').hide();
                });
            }
        };


        function start(){

            AnalyticsApp.init({
              minDate: $scope.partner.create_date,
              queryUrl: config.urls.spanel.analytics.sharing_data,
              initCircleSize: 150,
              allCircles: $scope.user.is_sailplay_admin,
              enabledCircles: {
                registeredUsersPurchasesCount: true
              },
              enabledDateSelectors: true
            });

        }

        if($scope.partner.create_date) start();

    });

