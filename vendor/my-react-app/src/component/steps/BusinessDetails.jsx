// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Search, Plus, X } from "lucide-react";

// const BusinessDetails = ({ data, onSave, onNext }) => {
//   const [categories, setCategories] = useState(data?.categories || []);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     defaultValues: data || {},
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//       {/* Category Section with Tailwind */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Add top categories (Upto 10) *
//         </label>
//         <input
//           type="text"
//           className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2"
//           placeholder="Search your product & category"
//         />

//         {/* Dynamic JSX rendering */}
//         <div className="flex flex-wrap gap-2">
//           {categories.map((category, index) => (
//             <span
//               key={index}
//               className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full"
//             >
//               {category}
//               <X size={14} />
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Grid layout with Tailwind */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <select
//           {...register("retailChannel", { required: true })}
//           className="w-full px-4 py-3 border rounded-lg focus:ring-2"
//         >
//           <option value="">Select channel</option>
//           <option value="amazon">Amazon</option>
//           <option value="flipkart">Flipkart</option>
//         </select>
//       </div>

//       <button
//         type="submit"
//         className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
//       >
//         Save & continue
//       </button>
//     </form>
//   );
// };

// export default BusinessDetails;
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

const BusinessDetails = ({ data, onSave, onNext }) => {
  const [categories, setCategories] = useState(data?.categories || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: data || {},
  });

  // ✅ ADD THIS FUNCTION
  const onSubmit = (formData) => {
    const finalData = {
      ...formData,
      categories,
    };

    onSave(finalData); // save to parent
    onNext(); // go to next step
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Category Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Add top categories (Upto 10) *
        </label>

        <input
          type="text"
          className="w-full pl-4 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2"
          placeholder="Search your product & category"
        />

        <div className="flex flex-wrap gap-2 mt-3">
          {categories.map((category, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full"
            >
              {category}
              <X
                size={14}
                className="cursor-pointer"
                onClick={() =>
                  setCategories(categories.filter((_, i) => i !== index))
                }
              />
            </span>
          ))}
        </div>
      </div>

      {/* Select Field */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          {...register("retailChannel", {
            required: "Retail channel is required",
          })}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2"
        >
          <option value="">Select channel</option>
          <option value="amazon">Amazon</option>
          <option value="flipkart">Flipkart</option>
        </select>

        {errors.retailChannel && (
          <p className="text-red-500 text-sm">{errors.retailChannel.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
      >
        Save & Continue
      </button>
    </form>
  );
};

export default BusinessDetails;
