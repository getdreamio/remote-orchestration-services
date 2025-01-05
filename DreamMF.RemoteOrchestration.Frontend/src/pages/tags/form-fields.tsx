import type React from "react";
import {
	Form,
	Input,
} from "antd";

const TagFormFields: React.FC = () => {
	return (
		<>
			<Form.Item
				label="Key"
				name="key"
				rules={[
					{ required: true, message: "Please provide a key." },
				]}
				tooltip="The key identifies the tag."
			>
				<Input placeholder="e.g., env-type" />
			</Form.Item>
			<Form.Item
				label="Display Name"
				name="display_Name"
				rules={[{ required: true, message: "Please provide a display name." }]}
			>
				<Input placeholder="e.g., Environment Type" />
			</Form.Item>
		</>
	);
};

export default TagFormFields;
