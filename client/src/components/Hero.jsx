import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import { motion } from 'motion/react'

const Hero = () => {

  const [pickupLocation, setPickupLocation] = useState('')
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(
      '/cars?pickupLocation=' +
      pickupLocation +
      '&pickupDate=' +
      pickupDate +
      '&returnDate=' +
      returnDate
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen pt-20 pb-10 flex flex-col items-center gap-10 bg-light text-center"
    >

      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-3xl md:text-5xl font-semibold px-4"
      >
        Luxury cars on Rent
      </motion.h1>

      <motion.form
        initial={{ scale: 0.95, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 rounded-2xl md:rounded-full w-[90%] max-w-md md:max-w-200 bg-white shadow-lg"
      >

        <div className="flex flex-col md:flex-row w-full gap-6 md:gap-10 md:ml-8">

          {/* Pickup Location */}
          <div className="flex flex-col items-start gap-2 w-full">
            <select
              required
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-primary"
            >
              <option value="">Pickup Location</option>
              {cityList.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <p className="px-1 text-sm text-gray-500">
              {pickupLocation ? pickupLocation : 'Please select location'}
            </p>
          </div>

          {/* Pickup Date */}
          <div className="flex flex-col items-start gap-2 w-full">
            <label htmlFor="pickup-date" className="text-sm font-medium">
              Pick-up Date
            </label>
            <input
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              type="date"
              id="pickup-date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Return Date */}
          <div className="flex flex-col items-start gap-2 w-full">
            <label htmlFor="return-date" className="text-sm font-medium">
              Return Date
            </label>
            <input
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              type="date"
              id="return-date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-primary"
              required
            />
          </div>

        </div>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-3 mt-4 md:mt-0 bg-primary hover:bg-primary-dull text-white rounded-full"
        >
          <img src={assets.search_icon} alt="search" className="brightness-300" />
          Search
        </motion.button>

      </motion.form>

      {/* Car Image */}
      <motion.img
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        src={assets.main_car}
        alt="car"
        className="max-h-48 md:max-h-74 mt-4"
      />

    </motion.div>
  )
}

export default Hero