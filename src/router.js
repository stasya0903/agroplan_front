import Vue from 'vue';
import Router from 'vue-router';
import PlantationList from '@/components/PlantationList.vue';
import WorkerList from "@/components/WorkerList.vue";
import WorkerTypesList from "@/components/WorkerTypesList.vue";
import WorkList from "@/components/WorkList.vue";
import WorkerShiftList from "@/components/WorkerShiftList.vue";
import SpendingList from "@/components/SpendingList.vue";
import IncomingList from "@/components/IncomingList.vue";
import BudgetList from "@/components/BudgetList.vue";
import ChemicalManager from "@/components/ChemicalManager.vue";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/plantations',
            name: 'PlantationList',
            component: PlantationList,
        },
        {
            path: '/workers',
            name: 'WorkerList',
            component: WorkerList,
        },
        {
            path: '/work-types',
            name: 'WorkerTypesList',
            component: WorkerTypesList,
        },
        {
            path: '/works',
            name: 'WorkList',
            component: WorkList,
        },
        {
            path: '/worker-shifts',
            name: 'WorkerShiftList',
            component: WorkerShiftList,
        },
        {
            path: '/spending',
            name: 'SpendingList',
            component: SpendingList,
        },
        {
            path: '/incoming',
            name: 'IncomingList',
            component: IncomingList,
        },
        {
            path: '/chemicals',
            name: 'ChemicalManager',
            component: ChemicalManager,
        },
        {
            path: '/budget',
            name: 'BudgetList',
            component: BudgetList,
        },

    ],
});