// src/routes/a/+page.server.js
import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(308, '/home');
}
