class FormHandler {
    constructor() {
        this.form = document.querySelector('.feedback-form-container');

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });

        this.initPhoneMask();
        this.initRating();
        this.initFileUpload();
    }

    initPhoneMask() {
        const phoneInput = this.form.querySelector('[name="phone"]');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            let formatted = '+7 ';
            if (value.length > 1) formatted += '(' + value.slice(1, 4);
            if (value.length >= 4) formatted += ') ' + value.slice(4, 7);
            if (value.length >= 7) formatted += '-' + value.slice(7, 9);
            if (value.length >= 9) formatted += '-' + value.slice(9, 11);

            e.target.value = formatted;
        });
    }

    initRating() {
        const stars = this.form.querySelectorAll('.rating__star');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.setRating(index + 1);
            });

            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });

            star.addEventListener('mouseleave', () => {
                this.resetHighlight();
            });
        });
    }

    setRating(rating) {
        const stars = this.form.querySelectorAll('.rating__star');
        stars.forEach((star, index) => {
            star.classList.toggle('rating__star--active', index < rating);
        });

        const ratingInput = this.form.querySelector('[name="rating"]');
        if (ratingInput) {
            ratingInput.value = rating;
        }
    }

    highlightStars(rating) {
        const stars = this.form.querySelectorAll('.rating__star');
        stars.forEach((star, index) => {
            star.classList.toggle('rating__star--hover', index < rating);
        });
    }

    resetHighlight() {
        const stars = this.form.querySelectorAll('.rating__star');
        const ratingInput = this.form.querySelector('[name="rating"]');
        const rating = parseInt(ratingInput?.value || 0, 10);

        stars.forEach((star, index) => {
            star.classList.remove('rating__star--hover');
            star.classList.toggle('rating__star--active', index < rating);
        });
    }


    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showError(field, 'Поле обязательно для заполнения');
                isValid = false;
            } else {
                this.hideError(field);
            }
        });

        const emailField = this.form.querySelector('[name="email"]');
        if (emailField && emailField.value && !this.validateEmail(emailField.value)) {
            this.showError(emailField, 'Введите корректный email');
            isValid = false;
        }

        const fileField = this.form.querySelector('[name="file"]');
        if (fileField.files.length > 0) {
            const file = fileField.files[0];
            if (!this.validateFile(file)) {
                this.showError(fileField, 'Некорректный файл');
                isValid = false;
            }
        }

        if (isValid) {
            this.submitForm();
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(field, message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;

        field.parentNode.appendChild(errorElement);
        field.classList.add('form-input--error');
    }

    hideError(field) {
        const errorElement = field.parentNode.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.classList.remove('form-input--error');
    }

    submitForm() {
        const thankYou = document.querySelector('.thank-you');
        thankYou.classList.remove('hidden');

        this.form.style.display = 'none';
        this.form.reset();
        this.resetRating();
    }

    resetRating() {
        const stars = this.form.querySelectorAll('.rating__star');
        stars.forEach(star => {
            star.classList.remove('rating__star--active');
        });

        const ratingInput = this.form.querySelector('[name="rating"]');
        if (ratingInput) {
            ratingInput.value = '';
        }
    }

    initFileUpload() {
        const fileInput = this.form.querySelector('.file-upload__input');
        const fileWrapper = this.form.querySelector('.file-upload__wrapper');
        const filePreviews = this.form.querySelector('.file-previews');

        if (!fileInput || !fileWrapper || !filePreviews) return;

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileSelect(files, fileWrapper, filePreviews);
        });
    }

    handleFileSelect(files, wrapper, previewsContainer) {
        previewsContainer.innerHTML = '';

        if (files.length > 0) {
            wrapper.classList.add('file-upload__wrapper--has-files');
        } else {
            wrapper.classList.remove('file-upload__wrapper--has-files');
        }

        files.forEach((file, index) => {
            if (!this.validateFile(file)) {
                alert(`Файл ${file.name} не соответствует требованиям`);
                return;
            }

            this.createFilePreview(file, index, previewsContainer);
        });
    }

    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            return false;
        }

        return true;
    }

    createFilePreview(file, index, container) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'file-preview';

            preview.innerHTML = `
            <img src="${e.target.result}" alt="Preview" class="preview-image">
            <div class="preview-remove" data-index="${index}">×</div>
        `;

            container.appendChild(preview);

            const removeBtn = preview.querySelector('.preview-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFilePreview(preview, index);
            });
        };

        reader.readAsDataURL(file);
    }

    removeFilePreview(previewElement, index) {
        const fileInput = this.form.querySelector('.file-upload__input');
        const files = Array.from(fileInput.files);

        previewElement.remove();

        const previews = this.form.querySelectorAll('.file-preview');
        if (previews.length === 0) {
            const wrapper = this.form.querySelector('.file-upload__wrapper');
            wrapper.classList.remove('file-upload__wrapper--has-files');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new FormHandler();
});