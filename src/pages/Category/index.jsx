import React, { Component } from 'react'
import { Card, Table, Modal } from 'antd';
import {
    SwapRightOutlined,
    PlusOutlined,
} from '@ant-design/icons'
import LinkButton from "../../components/LinkButton"
import AddForm from "./AddForm"
import UpdateForm from "./UpdateForm"
import { reqCategory,reqUpdateCategory,reqAddCategory} from "../../api"

export default class Category extends Component {
    state = {

        dataSource: [], // 表格中的所有数据
        loading: false, // 是否正在加载
        parentName: "一级分类列表", //父级名称
        parentId: "0",   //父级Id
        visibleStatus: 0, // 0表示全部隐藏，1显示添加确认框，2显示更新确认框
        updateName: "", // 更新元素名称
        currentRowData:{},   //待更新元素的所有数据
        currentPageData:[],
        currentName:"一级分类列表",
        currentId:"0",
        usedDatas:[{id:"0",name:"一级分类列表"}]

    }

    // 点击查看子分类的回调
    handleCheckChild = async (text) => {
        // console.log(text) text为当前行的数据
        let {usedDatas} = this.state
        const currentId = text._id
        const currentName = text.name
        const currentData = {id:currentId,name:currentName}
        usedDatas = [...usedDatas,currentData]
        const dataSource = await this.getCategory(currentId)
        this.setState({dataSource,usedDatas})

    }
    // 点击查看子分类后，在标题点击一级分类列表后的回调
    handleCheckParent = async(id,index) => {
        const dataSource = await this.getCategory(id)
        const {usedDatas} = this.state
        const newUsedDatas = usedDatas.slice(0,index+1)
        this.setState({dataSource,usedDatas:newUsedDatas})
        // const dataSource = await this.getCategory(parentId)
        // this.setState({ parentId: "0",parentName: "一级分类列表"})
    }

    // 点击添加的回调 
    showAddModal = () => {
        this.setState({ visibleStatus: 1 })
    }

    // 添加对话框点击Ok后的回调
    handleAddCategory = () => {
        const categoryName = this.form.getFieldValue("newCategory")
        const parentName = this.form.getFieldValue("parentName")
        console.log(categoryName,parentName)
        this.setState({ visibleStatus: 0 })
        // reqAddCategory()
    }

    // 点击修改分类的回调
    showUpdateModal = (text) => {
        this.setState({ visibleStatus: 2, updateName: text.name,currentRowData:text})
    }
    // 修改对话框点击OK后的回调
    handleUpdateCategory = () => {
        const {parentId,currentRowData} = this.state
        // 1.隐藏对话框
        this.setState({ visibleStatus: 0 })
        // 2.发送请求修改数据库中的数据
        const categoryName = this.form.getFieldValue("updateName")
        this.form.resetFields()
        const categoryId = currentRowData._id
        reqUpdateCategory({categoryName,categoryId})
        // 3.更新表格
        this.getCategory(parentId)
    }
    // 获取表单的form对象，form对象上有很多神奇方法可以操作表单
    getFormInstance=(form)=>{
        this.form = form
    }

    // 对话框点击取消后的回调
    handleCancel = () => {
        this.setState({ visibleStatus: 0 })
        this.form.resetFields()
    }

    // 根据传入的id获取数据
    getCategory = async (id) => {
        this.setState({ loading: true })
        const dataSource = await reqCategory(id)
        this.setState({loading:false})
        return dataSource

    }
    //表格更新变化时的回调
    handleTableChange=(pagination)=>{
        console.log(pagination)
        const {current,pageSize} = pagination
        const startNum = (current-1)*pageSize
        const endNum = current * pageSize 
        const {dataSource} = this.state
        // slice方法包头不包尾
        const currentPageData = dataSource.slice(startNum,endNum)
        this.setState({currentPageData})
        console.log(currentPageData)
    }

    // 组件挂载后获取数据更新组件
    componentDidMount() {
        const getData = async()=>{
            const dataSource = await this.getCategory("0")
            // const currentPageData = dataSource.slice(0,10)
            this.setState({dataSource,loading:false})
        }
        getData()
        // const currentPageData = dataSource.slice(0,10)
        // this.setState({
        //     dataSource,
        //     loading: false,
            // currentPageData
        // })
    }
    // 表头
    columns = [
        {
            title: '分类的名称',
            dataIndex: 'name',
        },
        {
            title: '操作',
            width: 300,
            render: (text) => {
                
                return (
                    <span>
                        <LinkButton onClick={() => { this.showUpdateModal(text) }}>修改分类</LinkButton>
                        <LinkButton onClick={() => { this.handleCheckChild(text) }}>查看子分类</LinkButton>
                            
                    </span>
                )
            }
        }
    ]

    render() {
        // 卡片右侧
        const extra = (
            <LinkButton onClick={this.showAddModal}>
                <PlusOutlined />
                <span>添加</span>
            </LinkButton>)
        const { dataSource, parentName, loading, visibleStatus, parentId, updateName,currentPageData,usedDatas } = this.state

        return (

            <Card
                title={
                    usedDatas.map((useddata,index)=>{
                        if(index<usedDatas.length-1){
                            return(
                                <LinkButton onClick={()=>{this.handleCheckParent(useddata.id,index)}} key={useddata.id}>{useddata.name}<SwapRightOutlined /></LinkButton>
                            )
                        }else{
                            return(
                                <span key={useddata.id}>{useddata.name}</span>
                            )
                        }
                    })
                }

                extra={extra} >
                <Table
                    rowKey="_id"
                    dataSource={dataSource}
                    columns={this.columns}
                    loading={loading}
                    pagination={{pageSize:10}}
                    onChange={this.handleTableChange}
                >

                </Table>

                <Modal
                    title="添加"
                    visible={visibleStatus === 1}
                    onOk={this.handleAddCategory}
                    onCancel={this.handleCancel}
                    okText="确定"
                    cancelText="取消"
                >
                    <AddForm currentPageData={currentPageData} parentId={parentId} parentName={parentName} getFormInstance={this.getFormInstance}/>
                </Modal>

                <Modal
                    title="更新"
                    visible={visibleStatus === 2}
                    onOk={this.handleUpdateCategory}
                    onCancel={this.handleCancel}
                >
                    <UpdateForm updateName={updateName} getFormInstance={this.getFormInstance} />
                </Modal>
            </Card>
        )
    }
}
