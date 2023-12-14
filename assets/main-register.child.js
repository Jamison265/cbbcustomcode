const showMessages = (message, type, wrapper) => {
    if (wrapper.querySelector('.form__message')) wrapper.querySelector('.form__message').remove();

    const h2 = document.createElement('h2');
    h2.classList.add('form__message');
    h2.setAttribute('tabindex', '-1');
    h2.setAttribute('autofocus', '');
    h2.innerHTML = `
        <svg aria-hidden="true" focusable="false">
            <use href="#icon-${type}" />
        </svg>
        ${message}
    `;

    //inset h2 at the top of the form
    wrapper.insertBefore(h2, wrapper.firstChild);
};


document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('create_customer');
    registerForm.removeAttribute('onsubmit');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        try {
            const response = await fetch('/apps/appuction/register', {
                method: 'POST',
                body: formData
            });

            const jsonResponse = await response.json();

            if (jsonResponse.data.message === "sucessfully registered") {
                const successMessage = 'User created successfully, you can now go to your email to verify your account.';
                showMessages(successMessage, 'success', registerForm);
                registerForm.reset();
            }
        } catch (error) {
            const genericErrorMessage = 'Oops, something went wrong. Please check your information and try again.';
            showMessages(genericErrorMessage, 'error', registerForm);
        }
    });
});


