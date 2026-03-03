export function unformatPhone(phoneNumber: string): string {
    let phone = phoneNumber.replace(/\D/g, '');

    if (!phone.startsWith('55')) {
        phone = '55' + phone;
    }

    return phone;
}