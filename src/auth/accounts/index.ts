import local from "./account.local";
import local1 from "./account.local1";
import local2 from "./account.local2";
import local3 from "./account.local3";
import sit from "./account.sit";
import uat from "./account.uat";
import prod from "./account.prod";

export const accounts = {
    local: { ...local },
    local1: { ...local1 },
    local2: { ...local2 },
    local3: { ...local3 },
    sit: { ...sit },
    uat: { ...uat },
    prod: { ...prod },
};
