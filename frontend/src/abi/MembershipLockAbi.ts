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
        stateMutability: "nonpayable",  //表示这个函数会改状态，但不收 ETH
        inputs: [],
        outputs:[],
    }
] as const;
