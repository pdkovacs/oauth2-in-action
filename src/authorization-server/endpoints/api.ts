import { Request, Response } from "express";
import logger from "../../logger";
import { getUserInfos } from "../data";

const group1 = {
    groupName: "VIP",
    id: 0,
    members: [
        {
            id: 0,
            userName: "alice"
        }
    ],
    team: {
        demoTeam: true,
        id: 0,
        liveChatOn: true,
        subdomain: "string"
    }
};

const group2 = {
    groupName: "CRO",
    id: 1,
    members: [
        {
            id: 0,
            userName: "carol"
        }
    ],
    team: {
        demoTeam: true,
        id: 0,
        liveChatOn: true,
        subdomain: "string"
    }
};

export const getGroups = (req: Request, res: Response) => {
    console.log("getGroups headers", req.headers);
    res.json([group1, group2]);
};

interface  SynergyUser {
    readonly id: number;
    readonly userName: string;
}

interface SynergyProjectListResponseItem {
    readonly id: number;
    readonly team: any;
    readonly author: SynergyUser;
    readonly members: SynergyUser[];
    readonly abbreviation: string;
    readonly title: string;
    readonly externalId: string;
    readonly description: string;
    readonly conclusion: string;
    readonly status: string;
    readonly created: string;
}

const userInfos = getUserInfos();

const projects: SynergyProjectListResponseItem[] = [
    {
        id: 0,
        team: {
            demoTeam: true,
            id: 0,
            liveChatOn: true,
            subdomain: "string"
        },
        author: {id: 0, userName: userInfos.alice.sub},
        members: [{id: 0, userName: userInfos.alice.sub}, {id: 1, userName: userInfos.bob.sub}],
        abbreviation: "SYNPROJ1",
        title: "Synergy Project 1",
        externalId: "0",
        description: "Synergy Project 1 desc",
        conclusion: "WTF?",
        status: "some",
        created: new Date().toString()
    },
    {
        id: 1,
        team: {
            demoTeam: true,
            id: 0,
            liveChatOn: true,
            subdomain: "string"
        },
        author: {id: 0, userName: userInfos.alice.sub},
        members: [{id: 0, userName: userInfos.alice.sub}, {id: 2, userName: userInfos.carol.sub}],
        abbreviation: "SYNPROJ2",
        title: "Synergy Project 2",
        externalId: "1",
        description: "Synergy Project 2 desc",
        conclusion: "WTF?",
        status: "some",
        created: new Date().toString()
    }
];

export const getProjects = (req: Request, res: Response) => {
    const token = req.headers.authorization.substr("Bearer ".length);
    const tokenParts = token.split(".");
    const payload = JSON.parse( Buffer.from(tokenParts[1], "base64").toString("utf8"));
    console.log(payload.sub);
    const userProjects = projects.filter(proj => proj.members.find(member => payload.sub));
    logger.log("info", "Returning %o for %s", userProjects, payload.sub);
    res.json(userProjects);
};