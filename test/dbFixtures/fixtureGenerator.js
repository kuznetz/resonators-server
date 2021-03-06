import _ from 'lodash';

import {
    users,
    user_logins,
    leaders,
    clinics,
    followers,
    resonators,
    resonator_attachments,
    questions,
    answers,
    resonator_questions,
    resonator_answers,
    sent_resonators,
    versionable_assets,
    google_accounts,
    leader_calendars
} from '../../src/db/sequelize/models';

import uuid from 'uuid/v4';

export default function generateFixtures() {
    const fixtureList = [];
    const queue = [];

    const generateFixture = (entity) => {
        fixtureList.push(entity);
        return api;
    };

    const api = {
        generateUser: (...args) => generateFixture(generateUser(...args)),
        generateUserLogin: (...args) => generateFixture(generateUserLogin(...args)),
        generateLeader: (...args) => generateFixture(generateLeader(...args)),
        generateClinic: (...args) => generateFixture(generateClinic(...args)),
        generateFollower: (...args) => generateFixture(generateFollower(...args)),
        generateQuestion: (...args) => generateFixture(generateQuestion(...args)),
        generateResonator: (...args) => generateFixture(generateResonator(...args)),
        generateResonatorQuestion: (...args) => generateFixture(generateResonatorQuestion(...args)),
        generateSentResonator: (...args) => generateFixture(generateSentResonator(...args)),
        generateVersionableAsset: (...args) => generateFixture(generateVersionableAsset(...args)),
        generateGoogleAccount: (...args) => generateFixture(generateGoogleAccount(...args)),
        generateLeaderCalendar: (...args) => generateFixture(generateLeaderCalendar(...args)),
        last: () => _.last(fixtureList),
        fixtures: () => fixtureList,
        done() {
            return Promise
                .all(queue)
                .then(() => fixtureList);
        },

        preset1() {
            const userLogin = generateUserLogin();
            const user = userLogin.user;
            const leader = generateLeader({user});
            const clinic = generateClinic({user});
            const follower = generateFollower({leader, clinic});
            const resonator = generateResonator({leader, follower, clinic});

            return Promise
              .all(queue)
              .then(() => {
                  return {
                      user,
                      userLogin,
                      leader,
                      clinic,
                      follower,
                      resonator
                  };
              });
        },

        presetLeaderWithManyClinics() {
            const userLogin = generateUserLogin();
            const user = userLogin.user;
            const leader = generateLeader({user});
            const clinic1 = generateClinic({user});
            const clinic2 = generateClinic({user});
            const questionClinic1 = generateQuestion({leader, clinic: clinic1});
            const questionClinic2 = generateQuestion({leader, clinic: clinic2});

            return Promise.all(queue).then(() => {
                return {
                    user,
                    userLogin,
                    leader,
                    clinics: [clinic1, clinic2],
                    questions: [questionClinic1, questionClinic2]
                };
            });
        }
    }

    return api;

    function randStr(str) {
        const uuidSuffix = uuid();
        return `${str}_${uuidSuffix}`;
    }

    function generateUser() {
        const user = {
            id: uuid(),
            name: randStr('user'),
            email: `${randStr('user')}@bar.baz`,
            pass: '$2a$10$EJT3ZPB5W5ZM10F3lR6RyeUnNxVjsyQmJwPohB6.V3YOmKMNNqoSG',
            salt: '$2a$10$EJT3ZPB5W5ZM10F3lR6Rye'
        };

        queue.push(users.create(user));

        return user;
    }

    function generateUserLogin({user = generateUser()} = {}) {
        const entity = {
            user,
            id: uuid(),
            user_id: user.id
        };

        queue.push(user_logins.create(entity));

        return entity;
    }

    function generateLeader({user = generateUser()} = {}) {
        const entity = {
            user,
            id: uuid(),
            user_id: user.id,
            title: randStr('leader title'),
            description: randStr('leader description'),
            visible: 1
        };

        Object.defineProperty(entity, 'user', {value: user});

        queue.push(leaders.create(entity));

        return entity;
    }

    function generateClinic({user = generateUser()} = {}) {
        const entity = {
            user,
            id: uuid(),
            user_id: user.id,
            name: randStr('clinic')
        };

        queue.push(clinics.create(entity));

        return entity;
    }

    function generateFollower({
        user = generateUser(),
        clinic = generateClinic(),
        leader = generateLeader()
    } = {}) {
        const entity = {
            user,
            clinic,
            leader,
            id: uuid(),
            user_id: user.id,
            leader_id: leader.id,
            clinic_id: clinic.id,
            status: 1
        };

        queue.push(followers.create(entity));

        return entity;
    }

    function generateResonator({
        leader = generateLeader(),
        follower,
        items,
        questions,
        content,
        description,
        clinic = generateClinic(),
        fields = {}
    }) {
        follower = follower || generateFollower({leader});

        const id = uuid();

        items = items || [generateResonatorItem({resonator_id: id, owner_id: follower.user.id})];

        questions = questions || [generateQuestion({
            leader,
            clinic
        })];

        const resonatorQuestions = [generateResonatorQuestion({
            question: questions[0],
            resonator_id: id
        })];

        const resonatorAnswers = generateResonatorAnswers(resonatorQuestions[0]);

        const entity = Object.assign({}, {
            id,
            leader_id: leader.id,
            follower_id: follower.id,
            pop_email: true,
            pop_location_lat: 1.5,
            pop_location_lng: 3.4,
            pop_time: '2016-04-03T11:00:00.000Z',
            repeat_days: '1,2,3,4,5',
            last_pop_time: null,
            disable_copy_to_leader: false,
            content: content || randStr('a content'),
            link: randStr('a link'),
            title: randStr('a title'),
            description: description || randStr('a description'),
            items,
            questions: resonatorQuestions,
        }, fields);

        Object.defineProperty(entity, 'follower', {value: follower});
        Object.defineProperty(entity, 'answers', {value: resonatorAnswers});
        Object.defineProperty(entity, 'leader', {value: leader});

        queue.push(resonators.create(entity));

        return entity;
    }

    function generateResonatorItem({
        resonator_id,
        owner_id
    }) {
        const resonatorItem = {
            id: uuid(),
            resonator_id,
            media_kind: 'picture',
            media_format: 'png',
            media_id: 'media_id',
            title: 'an image',
            visible: 1,
            owner_id,
            owner_role: 'leader',
            link: 'a link'
        };

        queue.push(resonator_attachments.create(resonatorItem));

        return resonatorItem;
    }

    function generateResonatorQuestion({
        question,
        resonator_id
    }) {
        const entity = {
            id: uuid(),
            question_id: question.id,
            resonator_id,
            removed: false,
            question
        };

        queue.push(resonator_questions.create(entity));

        return entity;
    }

    function generateQuestion({
        leader,
        clinic,
        answers
    } = {}) {
        const id = uuid();
        answers = answers || [generateAnswer({question_id: id})];

        const entity = {
            id,
            leader_id: leader.id,
            question_kind: 'numeric',
            description: randStr('description'),
            title: randStr('title'),
            removed: false,
            clinic_id: clinic.id,
            answers
        };

        Object.defineProperty(entity, 'leader', {value: leader});
        Object.defineProperty(entity, 'clinic', {value: clinic});

        queue.push(questions.create(entity));

        return entity;
    }

    function generateAnswer({
        question_id
    }) {
        const entity = {
            id: uuid(),
            question_id,
            body: randStr('answer'),
            rank: 1
        };

        queue.push(answers.create(entity));

        return entity;
    }

    function generateResonatorAnswers(resonatorQuestion) {
        const entity1 = {
            id: uuid(),
            resonator_question_id: resonatorQuestion.id,
            answer_id: resonatorQuestion.question.answers[0].id,
            sent_resonator_id: uuid()
        };

        const entity2 = {
            id: uuid(),
            resonator_question_id: resonatorQuestion.id,
            answer_id: resonatorQuestion.question.answers[0].id,
            sent_resonator_id: uuid()
        };

        queue.push(
            resonator_answers.create(entity1),
            resonator_answers.create(entity2)
        );

        return [entity1, entity2];
    }

    function generateSentResonator(resonator) {
        const entity = {
            id: uuid(),
            resonator_id: resonator.id
        };

        queue.push(sent_resonators.create(entity));

        return entity;
    }

    function generateVersionableAsset(mixin) {
        const entity = {
            id: uuid(),
            asset_id: `asset_${uuid()}`,
            asset_version: 1,
            link: 'foo',
            tag: `tag_${uuid()}`,
            ...mixin
        };

        queue.push(versionable_assets.create(entity));

        return entity;
    }

    function generateGoogleAccount({
        account,
        user = generateUser()
    } = {}) {
        const entity = {
            id: uuid(),
            user_id: user.id,
            access_token: uuid(),
            id_token: uuid(),
            refresh_token: uuid(),
            access_token_expiry_date: null,
            ...account
        };

        Object.defineProperty(entity, 'user', {value: user});

        queue.push(google_accounts.create(entity));

        return entity;
    }

    function generateLeaderCalendar({
        leader = generateLeader(),
        calendar_id = uuid()
    } = {}) {
        const entity = {
            leader_id: leader.id,
            calendar_id
        };

        Object.defineProperty(entity, 'leader', {value: leader});

        queue.push(leader_calendars.create(entity));

        return entity;
    }
}
