/* eslint-disable import/no-anonymous-default-export */
import React from 'react';
import SelectService from './selectService';

export default {
  title: 'Booking/Select Service',
  component: SelectService,
};

const Template = args => (
  <div className="w-96">
    <SelectService {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  id: '12',
  name: 'رادیولوژی مغز',
  disable: false,
};
