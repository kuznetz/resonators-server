import uuid from 'uuid/v4';

export default class VersionableAsset {
    constructor({
        id,
        asset_id,
        version,
        link,
        tag,
        created_at
    }) {
        this.id = id;
        this.asset_id = asset_id;
        this.version = version || 0;
        this.link = link;
        this.tag = tag;
        this.created_at = created_at;

        if (!id) {
            this.init();
        }
    }

    init() {
        this.id = uuid();
        this.version = 0;
    }

    incrementVersion() {
        this.version++;
    }

    updateLink(link) {
        this.link = link;
    }

    toString() {
        return `${this.asset_id}-${this.version}`;
    }
}
