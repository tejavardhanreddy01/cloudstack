// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

(function() {
    var listView = function(args) {
        var basicArgs = {
            listView: {
                fields: {},
                dataProvider: function() {}
            }
        };

        return $('<div>').listView(
            $.extend(true, {}, basicArgs, args)
        ).find('.list-view');
    };

    module('List view', {
        setup: function() {
            window.pageSize = 20;
        },
        teardown: function() {
            delete window.pageSize;
        }
    });

    test('Basic', function() {
        var $listView = listView();
        var $toolbar = $listView.find('> .toolbar');
        var $table = $listView.find('> .data-table');

        equal($listView.size(), 1, 'List view present');
        equal($toolbar.size(), 1, 'Toolbar present');
        equal($table.size(), 1, 'Data table div present');
        equal($table.find('> .fixed-header table thead tr').size(), 1, 'Fixed header present');
        equal($table.find('> table.body tbody').size(), 1, 'Body table present');
    });

    test('Fields: basic', function() {
        var $listView = listView({
            listView: {
                fields: {
                    fieldA: { label: 'TestFieldA' }
                }
            }
        });
        var $fields = $listView.find('.fixed-header table thead tr th');

        equal($fields.size(), 1, 'Column present');
        ok($fields.hasClass('fieldA'), 'Has ID as classname');
        equal($fields.html(), 'TestFieldA', 'Has correct label');
    });

    test('Fields: n columns', function() {
        var testFields = {
            fieldA: { label: 'TestFieldA' },
            fieldB: { label: 'TestFieldB' },
            fieldC: { label: 'TestFieldC' }
        };

        var $listView = listView({
            listView: {
                fields: testFields
            }
        });
        var $fields = $listView.find('.fixed-header table thead tr th');

        $.each(testFields, function(k, v) {
            var $field = $fields.filter('.' + k);

            equal($field.size(), 1, k + '-> Column present');
            equal($field.html(), v.label, k + '-> Has correct label');
        });
    });

    test('Data loading state', function() {
        var $listView = listView();

        equal($listView.find('table.body tr.loading').size(), 1, 'Row has loading state');
        equal($listView.find('table.body tr.loading td.loading.icon').size(), 1, 'Row cell has loading icon');
    });

    asyncTest('Data provider: basic', function() {
        expect(3);
        var $listView = listView({
            listView: {
                fields: {
                    fieldA: { label: 'TestFieldA' },
                    fieldB: { label: 'TestFieldB' }
                },
                dataProvider: function(args) {
                    args.response.success({ data: [] });
                    
                    ok(true, 'Data provider called');
                    start();
                }
            }
        });

        equal($listView.find('.data-table table.body tbody tr.empty td').size(), 1, 'Body table has empty table row');
        equal($listView.find('.data-table table.body tbody tr.empty td').html(), 'label.no.data', 'Empty contents notice displayed');
    });

    asyncTest('Data provider: load data', function() {
        var $listView = listView({
            listView: {
                fields: {
                    fieldA: { label: 'TestFieldA' },
                    fieldB: { label: 'TestFieldB' }
                },
                dataProvider: function(args) {
                    args.response.success({
                        data: [
                            { fieldA: 'FieldDataA', fieldB: 'FieldDataB' }
                        ]
                    });
                    
                    start();
                }
            }
        });

        equal($listView.find('table.body tbody tr').size(), 1, 'Body table has table row');
        equal($listView.find('table.body tbody tr td').size(), 2, 'Body table has table cells');
        equal($listView.find('table.body tbody tr td.fieldA > span').html(), 'FieldDataA', 'FieldDataA content present');
        equal($listView.find('table.body tbody tr td.fieldB > span').html(), 'FieldDataB', 'FieldDataB content present');
    });

    asyncTest('Data provider: multiple rows of data', function() {
        var testData = [
            { fieldA: 'FieldDataA1', fieldB: 'FieldDataB1' },
            { fieldA: 'FieldDataA2', fieldB: 'FieldDataB2' },
            { fieldA: 'FieldDataA3', fieldB: 'FieldDataB3' }
        ];
        
        var $listView = listView({
            listView: {
                fields: {
                    fieldA: { label: 'TestFieldA' },
                    fieldB: { label: 'TestFieldB' }
                },
                dataProvider: function(args) {
                    args.response.success({
                        data: testData
                    });
                    
                    start();
                }
            }
        });

        equal($listView.find('table.body tbody tr').size(), 3, 'Body table has correct # of table rows');

        $(testData).map(function(index, data) {
            var $tr = $listView.find('table.body tbody tr').filter(function() {
                return $(this).index() === index;
            });
            
            equal($tr.find('td.fieldA > span').html(), 'FieldDataA' + (index + 1), 'FieldDataA' + (index + 1) + ' present');
            equal($tr.find('td.fieldB > span').html(), 'FieldDataB' + (index + 1), 'FieldDataB' + (index + 1) + ' present');
        });
    });
}());
