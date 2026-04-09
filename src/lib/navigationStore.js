import { writable } from 'svelte/store';

const initialView = window.location.hash.replace('#', '') || 'inicio';

function createNavigationStore() {
    const { subscribe, set, update } = writable({
        currentView: initialView,
        searchQuery: ''
    });

    return {
        subscribe,
        setView: (view) => {
            update(s => ({ ...s, currentView: view }));
            window.location.hash = view;
        },
        syncWithHash: () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) update(s => ({ ...s, currentView: hash }));
        },
        setSearchQuery: (query) => {
            update(s => ({ ...s, searchQuery: query }));
        }
    };
}

export const navigationStore = createNavigationStore();
