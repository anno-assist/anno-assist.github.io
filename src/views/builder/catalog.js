
export const buildings = {
    Market: 'market',
    Activity: 'activity',
    Information: 'information',
    Participation: 'participation',
    Residence_L1: 'tycoon_worker',
    Residence_L2: 'tycoon_employee',
    Residence_L3: 'tycoon_engineer',
    Residence_L4: 'tycoon_executive',
    Firestation: 'firestation',
    Hospital: 'hospital',
    Police: 'police',
    // Tech Buildings
    Tech_Market: 'tech_market',
    Tech_Laboratory: 'laboratory',
    Tech_Information: 'tech_information',
    Tech_Academy: 'academy',
    Tech_Residence_L1: 'assistant',
    Tech_Residence_L2: 'researcher',
    Tech_Residence_L3: 'genius',
};

const influences = {
    Company: Symbol('company_influence'),
    Activity: Symbol('activity_influence'),
    Information: Symbol('information_influence'),
    Participation: Symbol('participation_influence'),
    Firestation: Symbol('firestation_influence'),
    Hospital: Symbol('hospital_influence'),
    Police: Symbol('police_influence'),
    Academy: Symbol('academy_influence'),
};

export const buildingTemplates = {
    [buildings.Market]: {
        w: 6,
        h: 8,
        radius: 25,
        effect: influences.Company,
        affected: [influences.Firestation],
        color: [64, 64, 192]
    },
    [buildings.Activity]: {
        w: 6,
        h: 5,
        radius: 20,
        effect: influences.Activity,
        affected: [influences.Firestation],
        color: [192, 64, 192]
    },
    [buildings.Information]: {
        w: 6,
        h: 6,
        radius: 26,
        effect: influences.Information,
        affected: [influences.Firestation],
        color: [64, 192, 192]
    },
    [buildings.Participation]: {
        w: 7,
        h: 9,
        radius: 24,
        effect: influences.Participation,
        affected: [influences.Firestation],
        color: [192, 192, 64]
    },
    [buildings.Residence_L1]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ],
        color: [210, 210, 210],
        listOrder: 1
    },
    [buildings.Residence_L2]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ],
        color: [160, 160, 160],
        listOrder: 2
    },
    [buildings.Residence_L3]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Participation,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ],
        color: [110, 110, 110],
        listOrder: 3
    },
    [buildings.Residence_L4]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Participation,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ],
        color: [60, 60, 60],
        listOrder: 4
    },
    [buildings.Firestation]: {
        w: 3,
        h: 6,
        radius: 22,
        effect: influences.Firestation,
        affected: [influences.Firestation]
    },
    [buildings.Hospital]: {
        w: 4,
        h: 6,
        radius: 22,
        effect: influences.Hospital,
        affected: [influences.Firestation]
    },
    [buildings.Police]: {
        w: 5,
        h: 5,
        radius: 22,
        effect: influences.Police,
        affected: [influences.Firestation]
    },

    // ------------------------------
    // Tech Buildings
    // ------------------------------

    [buildings.Tech_Market]: {
        w: 6,
        h: 5,
        radius: 22,
        effect: influences.Company,
        affected: [influences.Firestation],
        color: [64, 64, 192]
    },
    [buildings.Tech_Laboratory]: {
        w: 4,
        h: 4,
        radius: 14,
        effect: influences.Activity,
        affected: [influences.Firestation],
        color: [192, 64, 192]
    },
    [buildings.Tech_Information]: {
        w: 6,
        h: 6,
        radius: 26,
        effect: influences.Information,
        affected: [influences.Firestation],
        color: [64, 192, 192]
    },
    [buildings.Tech_Academy]: {
        w: 6,
        h: 5,
        radius: 20,
        effect: influences.Academy,
        affected: [influences.Firestation],
        color: [192, 192, 64]
    },
    [buildings.Tech_Residence_L1]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
            influences.Academy,
        ],
        color: [210, 210, 210],
        listOrder: 9
    },
    [buildings.Tech_Residence_L2]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
            influences.Academy,
            influences.Information,
        ],
        color: [160, 160, 160],
        listOrder: 10
    },
    [buildings.Tech_Residence_L3]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
            influences.Academy,
            influences.Information,
        ],
        color: [110, 110, 110],
        listOrder: 11
    },
};
