import { DBService } from "../db-service";

class EventsPage {
    db = null;

    constructor() {
        this.db = DBService.getInstance();
    }

    async render(req, res) {
        let events = await this.db.getEvents();

        const params = {
            events: events
        }

        res.render('events', params);
    }

    async submit(req, res) {
        await this.db.clearEvents();

        this.render(req, res);
    }
}

export { EventsPage }