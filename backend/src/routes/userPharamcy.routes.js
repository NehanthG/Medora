import express from 'express';
import {getAllPharmacies , getOnePharmacy ,searchPharmacies} from '../controllers/userPharmacy.controllers.js';

const router = express.Router();

router.get('/allPharmacies', getAllPharmacies);
router.get('/search',searchPharmacies );

router.get('/:id', getOnePharmacy);
export default router;