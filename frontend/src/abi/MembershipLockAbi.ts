export const MEMBERSHIP_LOCK_ABI = [
    {
        type:"function",
        name:"hasValidMembership",
        stateMutability:"view",  //Only read, not modify
        inputs:[
            {
                name:"user",
                type:"address",
            },
        ],

        outputs:[
            {
                name:"",
                type:"bool",
            },
        ],
    },
    {
        type: "function",
        name: "purchaseMembership",
        stateMutability: "payable",  //表示这个函数会改状态, 并且可收 ETH
        inputs: [],
        outputs:[],
    }
] as const;
