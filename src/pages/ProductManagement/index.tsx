import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridSelectionModel,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import MainLayout from "../../layouts/MainLayout";
import { Button, Pagination, Skeleton, TablePagination } from "@mui/material";
import axios from "axios";
import { useAppSelector } from "../../hooks/useRedux";
import { IRootState } from "../../redux";
import Spinner from "../../components/Spinner";
import { apiURL } from "../../config/constanst";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import ActionMenu from "../../components/ActionMenu";
import { toast } from "react-toastify";
import CreateProductDialog from "./CreateProductDialog";
import UpdateProductDialog from "./UpdateProductDialog";

interface IProductHomePageResponse {
  id: string;
  name: string;
  startPrice: number;
  imagePath: string;
  username: string;
}

const ProductManagement = () => {
  const [deleteDisable, setDeleteDisable] = React.useState<boolean>(false);
  const [selectionModel, setSelectionModel] =
    React.useState<GridSelectionModel>([]);
  const { user, accessToken } = useAppSelector(
    (state: IRootState) => state.auth
  );
  const [products, setProducts] = React.useState<IProductHomePageResponse[]>(
    []
  );
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [totalRecord, setTotalRecord] = React.useState<number>(0);
  const [actionLoading, setActionLoading] = React.useState<boolean>(false);
  const [selectedRow, setSelectedRow] = React.useState<string | number>("");
  const [openCreateDialog, setOpenCreateDialog] =
    React.useState<boolean>(false);
  const [openUpdateDialog, setOpenUpdateDialog] =
    React.useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = React.useState<any | null>(null);

  const ROW_PER_PAGE = 10;

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${apiURL}/admin/products?page=${page}&limit=${ROW_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response?.data?.success) {
        setProducts(
          response?.data?.results.map((item: any) => {
            return {
              ...item,
              id: item?._id,
            };
          })
        );
        setTotalRecord(response?.data?.totalRecords);
      }
    } catch (error) {
      console.log("GET PRODUCT RESPONSE", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const response = await axios.get(
        `${apiURL}/admin/products?page=${page}&limit=${ROW_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response?.data?.success) {
        setProducts(
          response?.data?.results.map((item: any) => {
            return {
              ...item,
              id: item?._id,
            };
          })
        );
        setTotalRecord(response?.data?.totalRecords);
      }
    } catch (error) {
      console.log("GET PRODUCT RESPONSE", error);
    } finally {
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Tên sản phẩm", width: 460 },
    {
      field: "price",
      headerAlign: "left",
      align: "left",
      headerName: "Giá sản phẩm",
      type: "number",
      width: 150,
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <div className="w-[120px]">
            <p>{params.value?.toString()?.prettyMoney()}</p>
          </div>
        );
      },
    },

    {
      field: "thumbnail",
      headerName: "Hình ảnh",
      type: "string",
      width: 200,
      headerAlign: "left",
      align: "left",
      renderCell: (params: GridRenderCellParams<string>) => {
        return (
          <div className="w-[120px]">
            <img src={params.value} width={80} height={60} />
          </div>
        );
      },
    },
    {
      field: "totalRate",
      headerName: "Lượt đánh giá",
      width: 200,
    },
    {
      field: "actions",
      headerName: "Hành động",
      type: "string",
      width: 300,
      headerAlign: "left",
      align: "left",
      renderCell: (params: GridRenderCellParams<any>) => {
        const removeProduct = async (id: string | number) => {
          try {
            setActionLoading(true);
            setSelectedRow(id);
            //THIS NEED TO FIX
            const response = await axios.delete(
              `${apiURL}/admin/products/${id}/`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            console.log("REPONSE IS", response?.data);

            if (response?.data?.success) {
              setActionLoading(false);
              refreshProducts();
              toast.success("Xóa sản phẩm thành công");
            } else {
              console.log("Error", response?.data?.data, response?.data?.error);
            }
          } catch (error) {
            setActionLoading(false);
            console.log("Client Error", error);
          }
        };
        const options = [
          {
            id: "delete",
            title: "Xóa sản phẩm",
            onPress: () => removeProduct(params.row?.id),
            onActionSuccess: () => refreshProducts(),
          },
        ];
        return actionLoading && selectedRow == params.row?.id ? (
          <Spinner size={20} />
        ) : (
          <ActionMenu options={options} />
        );
      },
    },
  ];

  React.useEffect(() => {
    getAllProducts();
  }, [page]);

  React.useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <>
      <MainLayout
        title="Danh sách sản phẩm "
        content={
          isLoading ? (
            <div className="w-full h-full px-8 mt-20">
              <LoadingSkeleton />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-y-5 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-x-2">
                  <Pagination
                    onChange={(event, changedPage) => setPage(changedPage)}
                    count={Math.ceil(totalRecord / ROW_PER_PAGE)}
                    defaultPage={1}
                    page={page}
                  />
                </div>

                <button
                  onClick={() => setOpenCreateDialog(true)}
                  className="bg-blue-500 text-white  w-fit h-[40px] px-3 py-1 font-bold rounded-lg flex items-center hover:opacity-80"
                >
                  <p>Thêm sản phẩm</p>
                </button>
              </div>
              <div className="h-[800px] w-full">
                <DataGrid
                  rows={products}
                  columns={columns}
                  onRowClick={(params) => {
                    console.log("HEHE");
                    setOpenUpdateDialog(true);
                    setCurrentProduct(params?.row);
                  }}
                  pageSize={11}
                  disableSelectionOnClick
                  rowsPerPageOptions={[10]}
                  onSelectionModelChange={(newSelectionModel) => {
                    setDeleteDisable(!deleteDisable);
                    setSelectionModel(newSelectionModel);
                  }}
                  selectionModel={selectionModel}
                  checkboxSelection
                />
              </div>
            </div>
          )
        }
      />

      {openCreateDialog ? (
        <CreateProductDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onActionSucces={() => refreshProducts()}
        />
      ) : null}

      {openUpdateDialog ? (
        <UpdateProductDialog
          open={openUpdateDialog}
          currentProduct={currentProduct}
          onClose={() => setOpenUpdateDialog(false)}
          onActionSucces={() => refreshProducts()}
        />
      ) : null}
    </>
  );
};

export default ProductManagement;
