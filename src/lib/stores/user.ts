import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';

export const currentUser = writable<User | null>(null);
