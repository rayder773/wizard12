(function($) {

    $.fn.wizzy = function(options) {

        let settings = $.extend({
            stepNumbers: false,
            progressType: 'fill',
        }, options);

        return this.each(function() {
            let elem = $(this);
            let nav = elem.find('.wz-header nav');
            let navigator = elem.find('.wz-navigator');
            let footer = elem.find('.wizard-footer');
            let content = elem.find('.wz-inner');

            let btnNext = '<a href="#" class="btn next" data-action="next">Далее <i class="fas fa-angle-right"></i></a>';
            let btnBack = '<a href="#" id="prev" class="btn previous" data-action="back"><div class="prev-btn"></div></a>';
            let btnFinish = '<a href="#" class="btn btn-success right" data-action="finish">Finish <i class="fas fa-check"></i></a>';

            let step_links = elem.find('nav a').toArray();
            let step_count = step_links.length;
            let step_status = new Array(step_count);
            let step_content = elem.find('.wz-step').toArray();
            let link_width = $(step_links[0]).width();
            let step = 0;

            function init() {
                for (i = 1; i < step_count; i++) {
                    step_status[i] = 0;
                }
                step_status[0] = 1;
                updateTemplate();
                render();
            }

            function moveProgress(step) {
                if (settings.progressType == 'fill') {
                    let progressWidth = link_width * (step + 1);
                    nav.find('.progress').css({ 'width': progressWidth + 'px' });
                }
                if (settings.progressType == 'slide') {
                    nav.find('.progress').css({ 'width': link_width + 'px' });
                    let distance = link_width * (step);
                    nav.find('.progress').css({ 'left': distance + 'px' });
                }

            }

            function updateTemplate() {
                nav.append('<div class="progress"></div>');
                moveProgress(step);
                step_links.forEach(element => {
                    $(element).wrapInner('<span></span>');
                });
            }

            /**
             * 
             * @param {boolean} show 
             */
            function loader(show) {
                let loader = '<div class="loading"></div>';
                if (show === true) { //Show Loader Spinner
                    content.fadeOut(400, function() {
                        elem.addClass('progress');
                        setTimeout(() => {
                            elem.append(loader);
                        }, 500);
                    });
                } else {
                    elem.find('.loading').remove();
                    elem.removeClass('progress');
                    setTimeout(() => {
                        content.fadeIn(400);
                    }, 400);
                }
            }

            /**
             * 
             * @param {string} action 
             */
            function react(action) {

                if (step >= 0 && step < step_count) {
                    if (action === 'next') {
                        const value = elem[0].innerText;

                        const phoneReg = 'Номер телефона абитуриента';
                        const emailReg = 'E-mail абитуриента';
                        const nameReg = 'Имя, Фамилия абитуриента';

                        if (value.match(phoneReg) == phoneReg) {
                            const phoneNumber = $('#telephone');
                            let isValidPhone = phoneNumber[0].value.length >= 11;
                            if (!isValidPhone) {
                                $('#telephone').addClass('wizard-invalid-input');
                            }
                            $('#telephone').on('keyup', function() {
                                const phoneNumber = $('#telephone');
                                let isValidPhone = phoneNumber[0].value.length >= 11;
                                if (!isValidPhone) {
                                    $('#telephone').addClass('wizard-invalid-input');
                                } else {
                                    $('#telephone').removeClass('wizard-invalid-input');
                                }
                            });
                            if (!isValidPhone) {
                                return false;
                            }
                        } else if (value.match(emailReg) == emailReg) {
                            let isCheked = $('#private-policy').is(':checked');
                            if (!isCheked) {
                                $('.wizard-private-policy-container').addClass('wizard-check-not-filled')
                            }

                            let isValid = ($('#emailInput').val().match(/.+?\@.+/g) || []).length === 1;
                            isValid ? $('#emailInput').removeClass('wizard-invalid-input') : $('#emailInput').addClass('wizard-invalid-input');

                            $('#emailInput').on('keyup', function() {
                                isValid = ($('#emailInput').val().match(/.+?\@.+/g) || []).length === 1;
                                isValid ? $(this).removeClass('wizard-invalid-input') : $(this).addClass('wizard-invalid-input');
                            });

                            $('.wizard-private-policy-container').change(function() {
                                isCheked = $('#private-policy').is(':checked');
                                isCheked ? $(this).removeClass('wizard-check-not-filled') : $(this).addClass('wizard-check-not-filled')
                            })
                            if (!isValid || !isCheked) return false;
                        } else if(value.match(nameReg) == nameReg) {
                            const wizardName = $('#wizard-name');
                            let isValidName = wizardName[0].value.length >= 1;
                            if (!isValidName) {
                                $('#wizard-name').addClass('wizard-invalid-input');
                            }
                            $('#wizard-name').on('keyup', function() {

                                const wizardName = $('#wizard-name');
                                isValidName = wizardName[0].value.length >= 1;
                                if (!isValidName) {
                                    $('#wizard-name').addClass('wizard-invalid-input');
                                } else {
                                    $('#wizard-name').removeClass('wizard-invalid-input');
                                }
                            });
                            if (!isValidName) {
                                return false;
                            }
                        }

                        step_status[step++] = 1;
                        if (step_status[step] === 0) {
                            step_status[step] = 1;
                        }
                        render(step);
                    } else if (action == 'back') {
                        step--;
                        render(step);
                    } else if (action == 'finish') {
                        loader(true);
                        setTimeout(() => {
                            loader(false);
                        }, 3000);
                    }
                }

            }

            /**
             * Render out the content
             */
            function render() {
                navigator.html('');
                // footer.html('');

                if (step === 0) {
                    btnBack = '<a href="#" id="prev" class="previous"><div class="prev-btn"></div></a>';
                    navigator.append(btnBack, btnNext);
                } else if (step === step_count - 1) {
                    $('.wz-header').remove();
                    $('.popup').remove();
                } else {
                    btnBack = '<a href="#" id="prev" class="btn previous" data-action="back"><div class="prev-btn"></div></a>';
                    navigator.append(btnBack + btnNext);
                }

                elem.find('nav a').removeClass('active completed');
                for (i = 0; i < step; i++) {
                    $(step_links[i]).addClass('completed');
                }
                $(step_links[i]).addClass('active');

                elem.find('.wz-body .wz-step').removeClass('active');
                $(step_content[step]).addClass('active');

                elem.find("#counter").text(((step + 1) / (step_count) * 100).toFixed() + '%');

                moveProgress(step);
            }

            /**
             * Click events
             */
            $(elem).on('click', '.wz-navigator .btn', function(e) {
                e.preventDefault();
                let action = $(this).data('action');
                react(action);
            });

            $(elem).on('click', 'nav a', function(e) {
                e.preventDefault();
                let step_check = $(this).index();
                if (step_status[step_check] === 1 || step_status[step_check] === 2) {
                    step = $(this).index();
                    render();
                } else {
                    console.log('Check errors');
                }
            });


            init();
        });
    }

}(jQuery));