import _ from 'lodash';
import User from '../domain/entities/user';
import Leader from '../domain/entities/leader';
import Follower from '../domain/entities/follower';
import Resonator from '../domain/entities/resonator';
import Question from '../domain/entities/question';
import ResonatorAttachment from '../domain/entities/resonatorAttachment';
import SentResonator from '../domain/entities/sentResonator';
import VersionableAsset from '../domain/entities/versionableAsset';
import GoogleAccount from '../domain/entities/googleAccount';

export function toUser(dbUser) {
    return new User({
        id: dbUser.get('id'),
        name: dbUser.get('name'),
        email: dbUser.get('email'),
        unsubscribed: dbUser.get('unsubscribed'),
        country: dbUser.get('country'),
        pass: dbUser.get('pass'),
        salt: dbUser.get('salt')
    });
}

export function toLeader(r) {
    return new Leader({
        id: r.get('id')
    });
}

export function toFollower(r) {
    return new Follower({
        id: r.get('id'),
        user: r.user && toUser(r.user),
        user_id: r.get('user_id'),
        leader_id: r.get('leader_id'),
        clinic_id: r.get('clinic_id'),
        status: r.get('status'),
        frozen: !!r.get('frozen'),
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at')
    });
}

export function toResonator(r) {
    const resonator_attachments = _.map(r.resonator_attachments, toResonatorAttachment);
    const resonator_questions = _(r.resonator_questions).map(toResonatorQuestion).orderBy(rq => rq.updated_at).value();
    let repeat_days = r.get('repeat_days');
    repeat_days = repeat_days ? repeat_days.split(',').map(s => parseInt(s)) : [];

    return new Resonator({
        id: r.get('id'),
        leader_id: r.get('leader_id'),
        follower_id: r.get('follower_id'),
        description: r.get('description'),
        title: r.get('title'),
        link: r.get('link'),
        content: r.get('content'),
        pop_email: r.get('pop_email'),
        pop_location_lat: r.get('pop_location_lat'),
        pop_location_lng: r.get('pop_location_lng'),
        pop_time: r.get('pop_time'),
        repeat_days,
        last_pop_time: r.get('last_pop_time'),
        disable_copy_to_leader: r.get('disable_copy_to_leader'),
        items: resonator_attachments,
        questions: resonator_questions,
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at')
    });
}

function toResonatorAttachment(r) {
    return new ResonatorAttachment({
        id: r.get('id'),
        resonator_id: r.get('resonator_id'),
        media_kind: r.get('media_kind'),
        media_format: r.get('media_format'),
        media_id: r.get('media_id'),
        title: r.get('title'),
        visible: r.get('visible'),
        owner_id: r.get('owner_id'),
        owner_role: r.get('owner_role'),
        link: r.get('link'),
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at')
    });
}

function toResonatorQuestion(r) {
    const question = toQuestion(r.get('question'));

    return {
        id: r.get('id'),
        question_id: r.get('question_id'),
        resonator_id: r.get('resonator_id'),
        removed: r.get('removed'),
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at'),
        question
    };
}

export function toQuestion(r) {
    const answers = (r.answers || []).map(toAnswer);

    return new Question({
        id: r.get('id'),
        leader_id: r.get('leader_id'),
        question_kind: r.get('question_kind'),
        description: r.get('description'),
        title: r.get('title'),
        removed: r.get('removed'),
        clinic_id: r.get('clinic_id'),
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at'),
        answers
    });
}

function toAnswer(r) {
    return {
        id: r.get('id'),
        body: r.get('body'),
        rank: r.get('rank')
    };
}

export function toSentResonator(r) {
    return new SentResonator({
        id: r.get('id'),
        resonator_id: r.get('resonator_id'),
        created_at: r.get('created_at'),
        updated_at: r.get('updated_at')
    });
}

export function toVersionableAsset(row) {
    return new VersionableAsset({
        id: row.get('id'),
        asset_id: row.get('asset_id'),
        version: row.get('asset_version'),
        link: row.get('link'),
        tag: row.get('tag'),
        created_at: row.get('created_at')
    });
}

export function toGoogleAccount(row) {
    return new GoogleAccount({
        id: row.get('id'),
        id_token: row.get('id_token'),
        access_token: row.get('access_token'),
        refresh_token: row.get('refresh_token'),
        access_token_expiry_date: row.get('access_token_expiry_date'),
        user_id: row.get('user_id'),
        google_email: row.get('google_email')
    });
}
