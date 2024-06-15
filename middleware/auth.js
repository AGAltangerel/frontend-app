export default function ({ store, redirect}) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return redirect('/login');
    }
}