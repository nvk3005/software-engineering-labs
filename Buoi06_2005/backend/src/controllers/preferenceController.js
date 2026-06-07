import {
  addFavoriteProduct,
  getUserFavorites,
  getUserViewedProducts,
  removeFavoriteProduct,
} from "../services/preferenceService.js";

const send = (res, result) => res.status(result.status).json(result.body);

export async function listFavorites(req, res) {
  send(res, await getUserFavorites(req.user.id));
}

export async function createFavorite(req, res) {
  send(res, await addFavoriteProduct(req.user.id, req.params.productId));
}

export async function deleteFavorite(req, res) {
  send(res, await removeFavoriteProduct(req.user.id, req.params.productId));
}

export async function listViewed(req, res) {
  send(res, await getUserViewedProducts(req.user.id, req.query));
}

