export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { installSsrfGuard } = await import('./lib/ssrf-guard');
    installSsrfGuard();
  }
}
