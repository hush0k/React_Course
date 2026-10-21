import { API_CONFIG, DATA_KEY } from "@/api/settings.js";
import { initialDataSample } from "@/api/initial-data-sample.js";

function fakeRequest(operation, options = {}) {
    const {
        minDelay = API_CONFIG.minDelay,
        maxDelay = API_CONFIG.maxDelay,
        errorChance = API_CONFIG.errorChance,
    } = options;

    return new Promise((resolve, reject) => {
        const delayMS =
            Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        setTimeout(() => {
            if (Math.random() < errorChance) {
                reject(new Error("Simulated server Error"));
                return;
            }

            try {
                resolve(operation());
            } catch (error) {
                reject(error);
            }
        }, delayMS);
    });
}

function initializeDatabase() {
    if (!localStorage.getItem(DATA_KEY)) {
        localStorage.setItem(DATA_KEY, JSON.stringify(initialDataSample));
    }
}

function readData() {
    return JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
}

function writeData(items) {
    localStorage.setItem(DATA_KEY, JSON.stringify(items));
}

initializeDatabase();

export async function getItemsList(query = "") {
    return fakeRequest(() => {
        const params = new URLSearchParams(query);
        const search = params.get("search");
        const city = params.get("city");
        const profession = params.get("profession");
        const status = params.get("status");
        const sort = params.get("sort") || "name";
        const page = Number(params.get("page")) || 1;
        const limit = Number(params.get("limit")) || 10;

        let items = readData();

        // search by name and description
        if (search) {
            const term = search.toLowerCase();
            items = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(term) ||
                    (item.description || "").toLowerCase().includes(term),
            );
        }

        // FILTER by city, profession and marital status
        if (city) {
            items = items.filter((item) => item.address?.city === city);
        }

        if (profession) {
            items = items.filter((item) => item.profession === profession);
        }

        if (status === "married") {
            items = items.filter((item) => item.married);
        } else if (status === "single") {
            items = items.filter((item) => !item.married);
        }

        // SORT by name or age
        items = [...items].sort((a, b) => {
            switch (sort) {
                case "name-desc":
                    return b.name.localeCompare(a.name);

                case "age":
                    return a.age - b.age;

                case "age-desc":
                    return b.age - a.age;

                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        // PAGINATION
        const total = items.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;

        const data = items.slice(start, start + limit);

        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    });
}

export async function getItem(id) {
    return fakeRequest(() => {
        const items = readData();

        const item = items.find((item) => item.id === Number(id));

        if (!item) {
            throw new Error("Item not found");
        }

        return item;
    });
}

export async function createItem(data) {
    return fakeRequest(() => {
        const items = readData();

        const nextId =
            items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

        const newItem = {
            ...data,
            id: nextId,
        };

        writeData([...items, newItem]);

        return newItem;
    });
}

export async function updateItem(id, changes) {
    return fakeRequest(() => {
        const numericId = Number(id);
        const items = readData();

        const exists = items.some((item) => item.id === numericId);

        if (!exists) {
            throw new Error("Item not found");
        }

        const updatedItems = items.map((item) =>
            item.id === numericId
                ? {
                    ...item,
                    ...changes,
                    id: numericId,
                }
                : item,
        );

        writeData(updatedItems);

        return updatedItems.find((item) => item.id === numericId);
    });
}

export async function deleteItem(id) {
    return fakeRequest(() => {
        const numericId = Number(id);
        const items = readData();

        const exists = items.some((item) => item.id === numericId);

        if (!exists) {
            throw new Error("Item not found");
        }

        const updatedItems = items.filter((item) => item.id !== numericId);

        writeData(updatedItems);

        return {
            success: true,
            id: numericId,
        };
    });
}