import type React from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography } from "antd";
import { useCreateTag } from "@/hooks/useTags";
import { Helmet } from "react-helmet";
import TagFormFields from "./form-fields";
import notify from '../../utils/notifications';

const { Title } = Typography;

interface FormData {
	key: string;
	display_Name: string;
}

const NewTagPage: React.FC = () => {
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const createTag = useCreateTag();

	const onFinish = async (formData: FormData) => {
		try {
			await createTag.mutateAsync(formData);
			notify.success("Tag created successfully");
			navigate("/tags");
		} catch (error) {
			notify.error("Error", "Failed to create tag");
		}
	};

	return (
		<div className="p-6">
			<Helmet>
				<title>[ROS] | Create Tag</title>
				<meta name="description" content={"Dream.mf [ROS] | Create Tag"} />
			</Helmet>
			<Title level={2} className="mb-6">
				New Tag
			</Title>
			<Card className="max-w-2xl bg-gray-50 dark:bg-gray-800">
				<Form form={form} layout="vertical" onFinish={onFinish}>
                    <TagFormFields />
					<Form.Item className="mb-0 flex justify-end">
						<Button className="mr-2" onClick={() => navigate("/tags")}>
							Cancel
						</Button>
						<Button type="primary" htmlType="submit">
							Create Tag
						</Button>
					</Form.Item>
				</Form>
			</Card>
		</div>
	);
};

export default NewTagPage;
