const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export function validateUsername(username) {
    if (username.length < 3) return "Минимум 3 символа";
    if (username.length > 50) return "Максимум 50 символов";
    if (!USERNAME_PATTERN.test(username)) return "Только латинские буквы, цифры и символы _ . -";
    return null;
}

export function validatePassword(password) {
    if (password.length < 6) return "Минимум 6 символов";
    if (new TextEncoder().encode(password).length > 72) return "Слишком длинный пароль (максимум 72 байта)";
    return null;
}
