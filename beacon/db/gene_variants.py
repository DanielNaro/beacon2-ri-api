import logging
from typing import Dict, List, Optional
from beacon.db.schemas import DefaultSchemas
from beacon.db.utils import query_id, query_ids, get_count, get_documents, get_cross_query, get_cross_query_variants, get_filtering_documents
from beacon.request.model import AlphanumericFilter, Operator, RequestParams
from beacon.db import client

LOG = logging.getLogger(__name__)

def apply_request_parameters(query: Dict[str, List[dict]], qparams: RequestParams):
     collection = 'gene_variants'
     LOG.debug("Request parameters = {}".format(qparams.query.request_parameters))
     if len(qparams.query.request_parameters) > 0 and "$and" not in query:
         query["$and"] = []
     for k, v in qparams.query.request_parameters.items():
         if v.isnumeric():
             v = float(v)
         if k == "min_biosamples":
             query["$and"].append({
                 "num_biosamples": {"$gte": v}
             })
         elif k == "max_biosamples":
             query["$and"].append({
                 "num_biosamples": {"$lte": v}
             })
         elif k == "min_variants":
             query["$and"].append({
                 "num_variants": {"$gte": v}
             })
         elif k == "max_variants":
             query["$and"].append({
                 "num_variants": {"$lte": v}
             })
         elif k == "gene_Id":
             query["$and"].append({
                 "gene_Id": {"$eq": v}
             })
     LOG.debug("Query = {}".format(query))
     return query


def get_gene_variants(entry_id: Optional[str], qparams: RequestParams, dataset: str):
    LOG.debug(f"get_gene_variants_by_id")
    collection = 'g_variants'
    LOG.debug(f"qparams: {qparams}")
    query = apply_request_parameters({}, qparams)
    if entry_id is not None:
        query["$and"].append({
            "gene_Id": {"$eq": entry_id}
        })
    LOG.debug(qparams.query.filters)
    schema = DefaultSchemas.GENOMICVARIATIONS

    limit = qparams.query.pagination.limit
    if limit > 100 or limit == 0:
        limit = 100

    count = get_count(client.beacon.genes_to_variants, query)

    docs = get_documents(
        client.beacon.genes_to_variants,
        query,
        qparams.query.pagination.skip*limit,
        limit
    )
    LOG.debug("")

    return schema, count, 1, docs


def get_gene_variants_with_id(entry_id: Optional[str], qparams: RequestParams, dataset: str):
    collection = 'g_variants'
    LOG.debug(f"qparams: {qparams}")
    query = apply_request_parameters({}, qparams)
    if "$and" not in query:
        query["$and"] = []
    if entry_id is not None:
        query["$and"].append({
            "gene_Id": {"$eq": entry_id}
        })
    LOG.debug(qparams.query.filters)
    schema = DefaultSchemas.GENOMICVARIATIONS

    limit = qparams.query.pagination.limit
    if limit > 100 or limit == 0:
        limit = 100

    count = get_count(client.beacon.genes_to_variants, query)

    docs = get_documents(
        client.beacon.genes_to_variants,
        query,
        qparams.query.pagination.skip * limit,
        limit
    )
    LOG.debug("")

    return schema, count, 1, docs